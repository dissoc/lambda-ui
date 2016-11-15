import App from "App.es6";
import R from "ramda";

const isActive = (toggleName) => {
    return R.pathOr(false, ["developmentToggles", toggleName]) (App.appStore().getState());
};

class DevToggles {
    get usePolling () {
        return isActive("usePolling");
    }
}

export default new DevToggles();