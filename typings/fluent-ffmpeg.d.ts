interface FluentFfmpeg {
    (path: string): FfmpegCommand;
    setFfmpegPath(path: string): void;
}

interface FfmpegCommand {
    audioCodec(codec: string): FfmpegCommand;
    videoCodec(codec: string): FfmpegCommand;
    on(event: 'error', callback: (err: Error, stdout: string, stderr: string) => void): FfmpegCommand;
    on(event: string, callback: Function): FfmpegCommand;
    save(target: string, options?: any): FfmpegCommand;
    format(format: string): FfmpegCommand;
    pipe(target: any, options?: any): FfmpegCommand;
    kill(): void;
}

declare var fluentFfmpeg: FluentFfmpeg;

declare module 'fluent-ffmpeg' {
    export = fluentFfmpeg;
}
