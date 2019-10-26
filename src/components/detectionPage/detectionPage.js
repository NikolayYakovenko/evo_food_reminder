import React from 'react';
import { Link } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import cs from 'classnames';

import me from './images/me.jpg';

import css from './detectionPage.css';


const MODEL_URL = '/models';

export const DetectionPage = () => {
    const detectionWithLandmarks = async (photoId, canvasId) => {
        const photo = document.getElementById(photoId);

        await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
        await faceapi.loadFaceLandmarkModel(MODEL_URL);
        await faceapi.loadFaceExpressionModel(MODEL_URL);
        // await faceapi.loadFaceRecognitionModel(MODEL_URL);

        const detectionsWithLandmarks = await faceapi
            .detectAllFaces(photo)
            .withFaceExpressions()
            .withFaceLandmarks();

        // resize the detected boxes and landmarks
        // in case your displayed image has a different size then the original
        const detectionsWithLandmarksResized = faceapi.resizeResults(
            detectionsWithLandmarks,
            { width: photo.width, height: photo.height },
        );
        const faceLandmarks = detectionsWithLandmarksResized.map(det => det.landmarks);

        const drawLandmarksOptions = {
            lineWidth: 2,
            drawLines: true,
            color: 'red',
        };

        // draw them into a canvas
        const canvas = document.getElementById(canvasId);
        canvas.width = photo.width;
        canvas.height = photo.height;

        faceapi.drawDetection(
            canvas,
            detectionsWithLandmarksResized, { withScore: true },
        );
        faceapi.drawDetection(
            canvas,
            detectionsWithLandmarksResized.map(det => det.detection),
        );
        faceapi.drawLandmarks(
            canvas,
            faceLandmarks,
            drawLandmarksOptions,
        );

        faceapi.drawFaceExpressions(
            canvas,
            detectionsWithLandmarksResized.map(({ detection, expressions }) => {
                // return { position: detection._box, expressions };
                return { position: detection.relativeBox, expressions };
            }),
        );
    };

    const uploadImage = async () => {
        const imgFile = document.getElementById('myFileUpload').files[0];
        // create an HTMLImageElement from a Blob
        const img = await faceapi.bufferToImage(imgFile);
        const imgElement = document.getElementById('imageForDetection');

        imgElement.src = img.src;
        imgElement.classList.remove(css.hidden);
        imgElement.classList.add(css.photo);

        if (document.getElementById('newCanvasElement')) {
            document.getElementById('newCanvasElement').remove();
        }

        const canvas1 = await faceapi.createCanvasFromMedia(imgElement);
        canvas1.id = 'newCanvasElement';
        canvas1.classList.add(css.canvas);

        imgElement.parentNode.appendChild(canvas1);

        detectionWithLandmarks('imageForDetection', 'newCanvasElement');
    };

    return (
        <div>
            <h1>Face detection</h1>
            <Link to='/'>Main page</Link>
            &nbsp;|&nbsp;
            <Link to='/recognition'>Recognition page</Link>
            <div className={css.videoWrapper}>
                <img
                    className={css.photo}
                    src={me}
                    alt='Kolyan'
                    id='photoForTest'
                />
                <canvas className={css.canvas} id='overlay' />
            </div>
            <button onClick={() => detectionWithLandmarks('photoForTest', 'overlay')}>
                Detect
            </button>

            <div className={css.videoWrapper}>
                <img
                    className={cs(css.photo, css.hidden)}
                    id='imageForDetection'
                    src=''
                    alt='For detection'
                />
            </div>
            <input
                id='myFileUpload'
                type='file'
                onChange={uploadImage}
                accept='.jpg, .jpeg, .png'
            />
        </div>
    );
};
