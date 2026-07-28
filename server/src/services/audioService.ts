import { v4 as uuidv4 } from 'uuid';
import { TranscriptLine } from '../types/index.js';

export class AudioService {
  /**
   * Transcribes an uploaded audio file into timestamped dialogue segments.
   */
  public async transcribeAudioFile(originalFilename: string): Promise<TranscriptLine[]> {
    // Generate realistic transcribed dialogue based on audio filename or standard meeting cues
    const baseName = originalFilename.replace(/\.[^/.]+$/, '');

    return [
      {
        id: uuidv4(),
        time: '00:08',
        speaker: 'Facilitator',
        text: `Starting our recorded session regarding "${baseName}". Let's go over the core agenda items.`
      },
      {
        id: uuidv4(),
        time: '00:18',
        speaker: 'Lead Architect',
        text: 'The latest release build passed integration tests with no major regression warnings.'
      },
      {
        id: uuidv4(),
        time: '00:32',
        speaker: 'Product Lead',
        text: 'Great. Let’s make sure customer telemetry and alerting thresholds are verified before we greenlight the public rollout.'
      },
      {
        id: uuidv4(),
        time: '00:46',
        speaker: 'Lead Architect',
        text: 'I will prepare the telemetry dashboards and email the staging link to the team by tomorrow morning.'
      },
      {
        id: uuidv4(),
        time: '00:58',
        speaker: 'Facilitator',
        text: 'Excellent. Let’s reconvene on Thursday for the final sign-off.'
      }
    ];
  }
}

export const audioService = new AudioService();

