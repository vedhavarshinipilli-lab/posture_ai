import math
import os
import threading
import time

import cv2
import mediapipe as mp
from fastapi import FastAPI
from fastapi.responses import JSONResponse, StreamingResponse
import uvicorn
from auth_api import setup_auth


mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose


def calculate_angle(a, b, c):
    """Angle at point b formed by segments ab and cb (degrees)."""
    ax, ay = a[0], a[1]
    bx, by = b[0], b[1]
    cx, cy = c[0], c[1]
    ang = math.degrees(
        math.atan2(cy - by, cx - bx) - math.atan2(ay - by, ax - bx)
    )
    ang = abs(ang)
    if ang > 180.0:
        ang = 360.0 - ang
    return ang


def squat_form_feedback(angle):
    if 70 <= angle <= 100:
        return "PERFECT FORM", (0, 255, 0)
    if angle < 60:
        return "TOO LOW", (0, 140, 255)
    if angle > 140:
        return "GO LOWER", (0, 0, 255)
    if angle < 70:
        return "RISE SLIGHTLY", (0, 255, 255)
    return "GO LOWER", (0, 0, 255)


def pushup_form_feedback(angle):
    if 70 <= angle <= 100:
        return "GOOD PUSH-UP", (0, 255, 0)
    if angle < 60:
        return "TOO LOW", (0, 140, 255)
    if angle > 140:
        return "GO DOWN", (0, 0, 255)
    if angle < 70:
        return "RISE SLIGHTLY", (0, 255, 255)
    return "GO DOWN", (0, 0, 255)


# --- shared state (pose worker updates; API reads) ---
_frame_lock = threading.Lock()
_jpeg_bytes = b""
_stats = {"reps": 0, "stage": "up", "feedback": ""}

counter = 0
stage = "up"
pushup_counter = 0
pushup_stage = "up"
mode = os.environ.get("REHAB_MODE", "squat").lower()
if mode not in ("squat", "pushup"):
    mode = "squat"

_stop_event = threading.Event()
_worker_thread: threading.Thread | None = None


def _camera_worker() -> None:
    global counter, stage, pushup_counter, pushup_stage, mode

    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    with mp_pose.Pose() as pose:
        while not _stop_event.is_set():
            ret, frame = cap.read()
            if not ret:
                time.sleep(0.05)
                continue

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(rgb)
            output = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
            h, w = output.shape[:2]

            feedback_text = ""

            if results.pose_landmarks:
                mp_drawing.draw_landmarks(
                    output,
                    results.pose_landmarks,
                    mp_pose.POSE_CONNECTIONS,
                )

                lm = results.pose_landmarks.landmark
                hip = (
                    lm[mp_pose.PoseLandmark.LEFT_HIP.value].x * w,
                    lm[mp_pose.PoseLandmark.LEFT_HIP.value].y * h,
                )
                knee = (
                    lm[mp_pose.PoseLandmark.LEFT_KNEE.value].x * w,
                    lm[mp_pose.PoseLandmark.LEFT_KNEE.value].y * h,
                )
                ankle = (
                    lm[mp_pose.PoseLandmark.LEFT_ANKLE.value].x * w,
                    lm[mp_pose.PoseLandmark.LEFT_ANKLE.value].y * h,
                )
                knee_angle = calculate_angle(hip, knee, ankle)

                r_shoulder = (
                    lm[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x * w,
                    lm[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y * h,
                )
                r_elbow = (
                    lm[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x * w,
                    lm[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y * h,
                )
                r_wrist = (
                    lm[mp_pose.PoseLandmark.RIGHT_WRIST.value].x * w,
                    lm[mp_pose.PoseLandmark.RIGHT_WRIST.value].y * h,
                )
                elbow_angle = calculate_angle(r_shoulder, r_elbow, r_wrist)

                if mode == "pushup":
                    if elbow_angle < 90:
                        pushup_stage = "down"

                    if elbow_angle > 160 and pushup_stage == "down":
                        pushup_stage = "up"
                        pushup_counter += 1

                if mode == "squat":
                    if knee_angle < 100:
                        stage = "down"

                    if knee_angle > 160 and stage == "down":
                        stage = "up"
                        counter += 1

                if mode == "squat":
                    cv2.putText(
                        output,
                        f"Left knee: {knee_angle:.1f} deg",
                        (10, 130),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1.0,
                        (0, 255, 0),
                        2,
                        cv2.LINE_AA,
                    )
                    squat_fb, squat_col = squat_form_feedback(knee_angle)
                    feedback_text = squat_fb
                    cv2.putText(
                        output,
                        f"Squat: {squat_fb}",
                        (10, 175),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1.0,
                        squat_col,
                        2,
                        cv2.LINE_AA,
                    )
                else:
                    cv2.putText(
                        output,
                        f"Right elbow: {elbow_angle:.1f} deg",
                        (10, 130),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1.0,
                        (200, 255, 200),
                        2,
                        cv2.LINE_AA,
                    )
                    pu_fb, pu_col = pushup_form_feedback(elbow_angle)
                    feedback_text = pu_fb
                    cv2.putText(
                        output,
                        f"Push-up: {pu_fb}",
                        (10, 175),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1.0,
                        pu_col,
                        2,
                        cv2.LINE_AA,
                    )
            else:
                feedback_text = "No pose"

            font = cv2.FONT_HERSHEY_SIMPLEX
            mode_label = "Mode: Squat" if mode == "squat" else "Mode: Push-up"
            (tw_m, _), _ = cv2.getTextSize(mode_label, font, 1.0, 2)
            cv2.putText(
                output,
                mode_label,
                ((w - tw_m) // 2, 35),
                font,
                1.0,
                (255, 255, 255),
                2,
                cv2.LINE_AA,
            )

            if mode == "squat":
                cv2.putText(
                    output,
                    f"Reps: {counter}",
                    (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1.0,
                    (255, 255, 0),
                    2,
                    cv2.LINE_AA,
                )
                cv2.putText(
                    output,
                    f"Stage: {stage}",
                    (10, 90),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1.0,
                    (200, 200, 200),
                    2,
                    cv2.LINE_AA,
                )
            else:
                pu_scale, pu_thick = 1.0, 2
                pu_line = f"Push-ups: {pushup_counter}"
                (tw_pu, _), _ = cv2.getTextSize(pu_line, font, pu_scale, pu_thick)
                cv2.putText(
                    output,
                    pu_line,
                    (w - tw_pu - 10, 70),
                    font,
                    pu_scale,
                    (255, 200, 0),
                    pu_thick,
                    cv2.LINE_AA,
                )
                pu_st_line = f"Push-up stage: {pushup_stage}"
                (tw_pus, _), _ = cv2.getTextSize(pu_st_line, font, pu_scale, pu_thick)
                cv2.putText(
                    output,
                    pu_st_line,
                    (w - tw_pus - 10, 105),
                    font,
                    pu_scale,
                    (180, 180, 255),
                    pu_thick,
                    cv2.LINE_AA,
                )

            ok, buf = cv2.imencode(".jpg", output, [cv2.IMWRITE_JPEG_QUALITY, 85])
            chunk = buf.tobytes() if ok else b""

            if mode == "squat":
                reps_v, stage_v = counter, stage
            else:
                reps_v, stage_v = pushup_counter, pushup_stage

            with _frame_lock:
                global _jpeg_bytes, _stats
                _jpeg_bytes = chunk
                _stats = {
                    "reps": reps_v,
                    "stage": stage_v,
                    "feedback": feedback_text,
                }

    cap.release()


def _mjpeg_generator():
    """Stream multipart JPEG; camera capture runs continuously in the worker thread."""
    while True:
        with _frame_lock:
            jpg = _jpeg_bytes
        if jpg:
            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + jpg + b"\r\n"
            )
        else:
            time.sleep(0.02)


app = FastAPI()
setup_auth(app)


@app.on_event("startup")
def _on_startup() -> None:
    global _worker_thread
    _stop_event.clear()
    _worker_thread = threading.Thread(target=_camera_worker, daemon=True)
    _worker_thread.start()


@app.on_event("shutdown")
def _on_shutdown() -> None:
    _stop_event.set()
    if _worker_thread is not None:
        _worker_thread.join(timeout=3.0)


@app.get("/video_feed")
def video_feed():
    return StreamingResponse(
        _mjpeg_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@app.get("/stats")
def stats():
    with _frame_lock:
        return JSONResponse(dict(_stats))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
