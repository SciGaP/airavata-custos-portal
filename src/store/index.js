import Vue from 'vue';
import Vuex from 'vuex';
import createLogger from 'vuex/dist/logger';
import collection from "./modules/collection.store";
import dataset from "./modules/dataset.store";
import user from "./modules/user.store";
import group from "./modules/group.store";
import auth from "./modules/auth.store";

import emcFile from "./modules/emc/emc-file.store";
import emcFolder from "./modules/emc/emc-folder.store";


Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
    modules: {
        collection,
        dataset,
        auth,
        user,
        group,
        "emcFile": emcFile,
        "emcFolder": emcFolder
    },
    strict: debug,
    plugins: debug ? [createLogger()] : [],
})