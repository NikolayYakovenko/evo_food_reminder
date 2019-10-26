import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import cs from 'classnames';

import css from './recognitionPage.css';


const MODEL_URL = '/models';
const IMAGES_URL = '/images';

const LABELS = [
    'julia', 'julia1',
    'tanya', 'tanya1',
    'dima', 'dima1',
    'kolyan', 'kolyan1',
    'svet1', 'igor',
];

export const RecognitionPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [loadedDescriptors, setDescriptors] = useState([]);

    const resizeCanvasAndResults = (dimensions, canvas, results) => {
        const canvasElement = canvas;
        const { width, height } = (dimensions instanceof HTMLVideoElement) ?
            faceapi.getMediaDimensions(dimensions)
            :
            dimensions;

        canvasElement.width = width;
        canvasElement.height = height;

        // resize detections (and landmarks) in case displayed image
        // is smaller than original size
        return faceapi.resizeResults(results, { width, height });
    };

    const loadModel = async () => {
        setIsLoading(true);
        setLoadingMessage('Loading model for face recognition');
        await Promise.all([
            await faceapi.loadSsdMobilenetv1Model(MODEL_URL),
            await faceapi.loadFaceLandmarkModel(MODEL_URL),
            await faceapi.loadFaceRecognitionModel(MODEL_URL),
        ]);
        setIsLoading(false);
    };

    useEffect(() => { loadModel(); }, []);

    const createLabeledDescriptors = async () => {
        const labeledFaceDescriptors = await Promise.all(LABELS
            .map(async (photoName) => {
                // fetch image data from urls and convert blob to HTMLImage element
                const imgUrl = `${IMAGES_URL}/${photoName}.jpg`;
                const img = await faceapi.fetchImage(imgUrl);

                // detect the face with the highest score in the image and
                // compute it's landmarks and face descriptor
                const fullFaceDescription = await faceapi
                    .detectSingleFace(img)
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (!fullFaceDescription) {
                    throw new Error(`no faces detected for ${photoName}`);
                }

                const faceDescriptors = [fullFaceDescription.descriptor];
                return new faceapi.LabeledFaceDescriptors(photoName, faceDescriptors);
            }));

        return labeledFaceDescriptors;
    };

    const drawDetectionOnPhoto = (photo, recognizedResults, faceMatcher) => {
        const canvasElement = document.getElementById('canvasForPhoto');
        const resizedResults = resizeCanvasAndResults(
            photo,
            canvasElement,
            recognizedResults,
        );

        const results = resizedResults.map((fd) => {
            return faceMatcher.findBestMatch(fd.descriptor);
        });

        const boxesWithText = results.map((bestMatch, i) => {
            const { box, score } = resizedResults[i].detection;
            const { _label } = bestMatch;

            const text = `${_label} (${score.toFixed(2)})`;
            const boxWithText = new faceapi.BoxWithText(box, text);
            return boxWithText;
        });

        faceapi.drawDetection(canvasElement, boxesWithText);
    };

    const recognizePhoto = async () => {
        setIsLoading(true);
        setLoadingMessage('Recognition of uploaded photo');

        const recognizedPhoto = document.getElementById('uploadedPhoto');
        const recognizedResults = await faceapi
            .detectAllFaces(recognizedPhoto)
            .withFaceLandmarks()
            .withFaceDescriptors();

        // create FaceMatcher with automatically assigned labels
        // from the detection results for the reference image
        if (loadedDescriptors && loadedDescriptors.length) {
            const faceMatcher = new faceapi.FaceMatcher(loadedDescriptors, 0.6);

            setLoadingMessage('Draw detection on photo');
            drawDetectionOnPhoto(
                recognizedPhoto,
                recognizedResults,
                faceMatcher,
            );
        } else {
            const data = await createLabeledDescriptors();
            const faceMatcher = new faceapi.FaceMatcher(data, 0.6);

            setDescriptors(data);
            setLoadingMessage('Draw detection on photo');
            drawDetectionOnPhoto(
                recognizedPhoto,
                recognizedResults,
                faceMatcher,
            );
        }

        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    const uploadImage = async () => {
        setIsLoading(true);
        setLoadingMessage('Photo uploading');
        const imgFile = document.getElementById('myFileUpload').files[0];
        // create an HTMLImageElement from a Blob
        const img = await faceapi.bufferToImage(imgFile);
        const imgElement = document.getElementById('uploadedPhoto');

        imgElement.src = img.src;
        imgElement.classList.remove(css.hidden);
        imgElement.classList.add(css.photo);

        if (document.getElementById('canvasForPhoto')) {
            document.getElementById('canvasForPhoto').remove();
        }

        const canvas = faceapi.createCanvasFromMedia(imgElement);
        canvas.id = 'canvasForPhoto';
        canvas.classList.add(css.canvas);

        imgElement.parentNode.appendChild(canvas);
        setIsLoading(false);
    };

    return (
        <div>
            <h1>Face recognition</h1>
            <Link to='/'>Main page</Link>
            &nbsp;|&nbsp;
            <Link to='/detection'>Detection page</Link>
            <div>
                <button onClick={recognizePhoto} disabled={isLoading}>
                    Recognize
                </button>
                {isLoading && loadingMessage ?
                    <span className={css.loadingMessage}>{loadingMessage}</span>
                    : null
                }
            </div>
            <div className={css.videoWrapper}>
                <img className={cs(css.photo, css.hidden)} id='uploadedPhoto' alt='add new' />
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
