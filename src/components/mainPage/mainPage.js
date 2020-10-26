import React from 'react';
import { Link } from 'react-router-dom';
import cs from 'classnames';
import * as faceapi from 'face-api.js';

import css from './mainPage.css';


const MODEL_URL = '/models';

export class MainPage extends React.Component {
    constructor(props) {
        super(props);

        this.inputRef = React.createRef();
        this.timer = null;
    }

    state = {
        isModelLoaded: false,
        detectionOn: false,
    };

    async componentDidMount() {
        await this.initDetection();
    }

    componentWillUnmount() {
        this.stopDetection();
    }

    startDetection = async () => {
        if (this.state.detectionOn) return;

        const overlayElem = document.getElementById('overlayElem');
        const videoEl = document.getElementById('inputVideo');
        const mtcnnForwardParams = {
            // limiting the search space to larger faces for webcam detection
            minFaceSize: 50,
        };
        const mtcnnResults = await faceapi.mtcnn(videoEl, mtcnnForwardParams);

        this.drawDetections(
            videoEl,
            overlayElem,
            mtcnnResults,
        );

        this.drawLandmarks(
            videoEl,
            overlayElem,
            mtcnnResults,
            true,
        );

        this.timer = requestAnimationFrame(this.startDetection);
    }

    stopDetection = () => {
        clearTimeout(this.startDetection);

        const videoEl = document.getElementById('inputVideo');

        navigator.getUserMedia(
            { video: {} },
            (stream) => {
                const track = stream.getTracks()[0];
                track.stop();
            },
            // eslint-disable-next-line no-console
            err => console.error(err),
        );

        videoEl.pause();
        cancelAnimationFrame(this.timer);
        this.setState({
            detectionOn: true,
        });
    }

    initDetection = async () => {
        this.setState({
            detectionOn: false,
        });

        // load the models
        if (!this.state.isModelLoaded) {
            try {
                await faceapi.loadMtcnnModel(MODEL_URL);
                await faceapi.loadFaceRecognitionModel(MODEL_URL);
                this.setState({
                    isModelLoaded: true,
                });
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`Can not load model ${error}`);
            }
        }

        // try to access users webcam and stream the images
        // to the video element
        const videoEl = document.getElementById('inputVideo');
        navigator.getUserMedia(
            { video: {} },
            (stream) => { videoEl.srcObject = stream; },
            // eslint-disable-next-line no-console
            err => console.error(err),
        );
    }

    resizeCanvasAndResults(dimensions, canvas, results) {
        const canvasElement = canvas;
        const { width, height } = (dimensions instanceof HTMLVideoElement) ?
            faceapi.getMediaDimensions(dimensions)
            :
            dimensions;

        canvasElement.width = width;
        canvasElement.height = height;

        // resize detections (and landmarks) in case displayed image is smaller than
        // original size
        return faceapi.resizeResults(results, { width, height });
    }

    drawDetections(dimensions, canvas, detections) {
        const resizedDetections = this.resizeCanvasAndResults(dimensions, canvas, detections);
        faceapi.drawDetection(canvas, resizedDetections);
    }

    drawLandmarks(dimensions, canvas, results, withBoxes = true) {
        const resizedResults = this.resizeCanvasAndResults(dimensions, canvas, results);

        if (withBoxes) {
            faceapi.drawDetection(canvas, resizedResults.map(det => det.detection));
        }

        const faceLandmarks = resizedResults.map(det => det.landmarks);
        const drawLandmarksOptions = {
            lineWidth: 4,
            drawLines: true,
            color: 'red',
        };
        faceapi.drawLandmarks(canvas, faceLandmarks, drawLandmarksOptions);
    }

    render() {
        return (
            <React.Fragment>
                <h1>Main page</h1>
                <Link to='/detection'>Detection page</Link>
                &nbsp;|&nbsp;
                <Link to='/recognition'>Recognition page</Link>
                <div className={css.videoWrapper}>
                    <video
                        className={css.video}
                        onPlay={this.startDetection}
                        id='inputVideo'
                        autoPlay
                        muted
                    >
                        <track kind='captions' />
                    </video>
                    <canvas className={css.canvas} id='overlayElem' />
                </div>
                {this.state.isModelLoaded ?
                    <div className={css.buttonWrapper}>
                        <button
                            className={cs(css.button, css.mainButton)}
                            onClick={this.initDetection}
                            type='button'
                        >
                            Start detection
                        </button>
                        <button
                            className={cs(css.button, css.secondaryButton)}
                            onClick={this.stopDetection}
                            type='button'
                        >
                            Stop detection
                        </button>
                    </div>
                    : null
                }
            </React.Fragment>
        );
    }
}

