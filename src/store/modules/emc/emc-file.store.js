import {emcService} from "@/store/util/emc.util";
import axios from "axios";

const state = {
    fileMap: {},
    fileDownloadMap: {},
    fileThumbnailMap: {},
    fileListMap: {}
};

function _getFilesQueryString({offset = 0, limit = 20, groupId = null, parentFolderId = null}) {
    const params = {offset, limit, groupId, parentFolderId};

    const queryString = Object.keys(params).map(paramKey => {
        if (params[paramKey] !== null) {
            return `${paramKey}=${params[paramKey]}`;
        } else {
            return "";
        }
    }).join("&");

    return queryString;
}

const actions = {

    async fetchFiles({commit}, {offset = 0, limit = 20, groupId = null, parentFolderId} = {}) {
        const queryString = _getFilesQueryString({offset, limit, groupId, parentFolderId});

        const files = await emcService.files.get({groupId, parentFolderId});
        const fileIds = files.map(({fileId, name, createdAt, createdBy, status, mimeType, entityId}) => {
            commit("SET_FILE", {fileId, name, createdAt, createdBy, status, mimeType, entityId});

            return fileId;
        });

        commit("SET_FILE_LIST", {queryString, fileIds});
    },

    async downloadFile({commit, state}, {fileId}) {
        if (!state.fileDownloadMap[fileId] || !state.fileDownloadMap[fileId].processing) {
            const fileDownload = {content: null, processing: true, errors: null, progress: 20};
            commit("SET_FILE_DOWNLOAD", {fileId, ...fileDownload});

            await new Promise((resolve => setTimeout(resolve, 1000)));
            fileDownload.progress = 30;
            commit("SET_FILE_DOWNLOAD", {fileId, ...fileDownload});


            await new Promise((resolve => setTimeout(resolve, 1000)));
            fileDownload.progress = 70;
            commit("SET_FILE_DOWNLOAD", {fileId, ...fileDownload});


            await new Promise((resolve => setTimeout(resolve, 1000)));
            fileDownload.progress = 99;
            commit("SET_FILE_DOWNLOAD", {fileId, ...fileDownload});

            fileDownload.content = await emcService.files.downloadFile({fileId});
            fileDownload.processing = false;
            fileDownload.progress = 100;
            commit("SET_FILE_DOWNLOAD", {fileId, ...fileDownload});
        }
    },

    async fetchFileThumbnail({commit}, {fileId}) {

        // TODO
        console.log(`[FETCH] /emc/file/${fileId}/thumbnail`);
        await new Promise(resolve => setTimeout(resolve, 10));

        //TODO
        const url = "data:image/jpeg;base64,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"

        const response = await axios.get(url, {responseType: 'arraybuffer'});
        const blob = new Blob([response.data], {type: response.headers['content-type']});
        const dataUrl = URL.createObjectURL(blob);
        commit("SET_FILE_THUMBNAIL", {fileId, dataUrl});
    }
}


const mutations = {
    SET_FILE(state, {fileId, name, createdAt, createdBy, status, mimeType, entityId}) {
        state.fileMap = {
            ...state.fileMap,
            [fileId]: {
                ...state.fileMap[fileId],
                fileId, name, createdAt, createdBy, status, mimeType, entityId
            }
        };
    },
    SET_FILE_DOWNLOAD(state, {fileId, content, processing, progress}) {
        state.fileDownloadMap = {
            ...state.fileDownloadMap,
            [fileId]: {
                ...state.fileDownloadMap[fileId],
                fileId, content, processing, progress
            }
        };
    },
    SET_FILE_THUMBNAIL(state, {fileId, dataUrl}) {
        state.fileThumbnailMap = {
            ...state.fileThumbnailMap,
            [fileId]: dataUrl
        };
    },
    SET_FILE_LIST(state, {queryString, fileIds}) {
        state.fileListMap = {
            ...state.fileListMap,
            [queryString]: fileIds
        };
    }
}


const getters = {

    getFiles: (state, getters) => {
        return ({offset = 0, limit = 20, groupId = null, parentFolderId = null} = {}) => {
            const queryString = _getFilesQueryString({offset, limit, groupId, parentFolderId});
            const fileIds = state.fileListMap[queryString];
            if (fileIds) {
                return fileIds.map(fileId => getters.getFile({fileId}));
            } else {
                return null;
            }
        }
    },

    getFile: (state) => {
        return ({fileId}) => {
            if (state.fileMap[fileId]) {
                const {name, createdAt, createdBy, status, mimeType, entityId} = state.fileMap[fileId];
                let fileThumbnailDataUrl = null;
                let download = null;

                if (state.fileThumbnailMap[fileId]) {
                    fileThumbnailDataUrl = state.fileThumbnailMap[fileId];
                }

                if (state.fileDownloadMap[fileId]) {
                    download = state.fileDownloadMap[fileId];
                }

                return {fileId, name, createdAt, createdBy, status, mimeType, fileThumbnailDataUrl, download, entityId};
            } else {
                return null;
            }
        }
    },

    getFileDownload: (state) => {
        return ({fileId}) => {
            if (state.fileDownloadMap[fileId]) {
                return state.fileDownloadMap[fileId];
            } else {
                return null;
            }
        }
    },

    getDownloadProcessingFiles: (state, getters) => {
        return () => {
            const processingFiles = [];
            for (let fileId in state.fileDownloadMap) {
                if (state.fileDownloadMap[fileId].processing) {
                    processingFiles.push(getters.getFile({fileId}))
                }
            }

            return processingFiles
        }
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}