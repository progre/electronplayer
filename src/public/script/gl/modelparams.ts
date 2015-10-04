export default class ModelParams {
    type: string;
    dualFisheye: {
        size: number;
        y: number;
        left: number;
        right: number;
    };

    static getDefault() {
        let thiz = new ModelParams();
        thiz.type = 'dualFisheye';
        thiz.dualFisheye = {
            size: 0.4503,
            y: 0.4536,
            left: 0.226,
            right: 0.7219
        };
        return thiz;
    }
}
