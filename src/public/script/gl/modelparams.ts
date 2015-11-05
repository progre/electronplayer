export default class ModelParams {
    ratioOfHeight: number;
    type: string;
    dualFisheye: {
        size: number;
        y: number;
        left: number;
        right: number;
    };
    direction: string;

    static getDefault(ratioOfHeight: number) {
        let instance = new ModelParams();
        instance.ratioOfHeight = ratioOfHeight;
        instance.type = 'dualFisheye';
        instance.dualFisheye = {
            size: 0.4433,
            y: 0.4953,
            left: 0.2229,
            right: 0.722
        };
        instance.direction = 'up';
        return instance;
    }
}
