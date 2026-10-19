import { tool as videoMergeVideo } from './merge-video/meta';
import { tool as changeSpeed } from './change-speed/meta';
import { tool as flipVideo } from './flip/meta';
import { gifTools } from './gif';
import { tool as trimVideo } from './trim/meta';
import { tool as rotateVideo } from './rotate/meta';
import { tool as compressVideo } from './compress/meta';
import { tool as loopVideo } from './loop/meta';
import { tool as cropVideo } from './crop-video/meta';
import { tool as addAudio } from './add-audio/meta';
import { tool as resizeVideo } from './resize/meta';
// BenitoTools: compressore veloce (WebCodecs) al posto di quello ffmpeg.wasm
import { tool as benitoCompress } from '../../../benito/tools/video-compress/meta';
void compressVideo;

export const videoTools = [
  ...gifTools,
  trimVideo,
  rotateVideo,
  benitoCompress,
  loopVideo,
  flipVideo,
  cropVideo,
  changeSpeed,
  videoMergeVideo,
  addAudio,
  resizeVideo
];
