/**
 * 파일명 : sf-FileHandler.js
 */
class sfFileHandler {
    /**
     * 생성자
     * @param {sfUiHandler} uiHandler UI 처리 객체
     * @param {object} config 설정 객체
     */
    constructor(uiHandler, config) {
        this.uiHandler = uiHandler;
        this.config = config;
    }

    /**
     * 파일 미리보기 함수
     * 이미지 파일을 읽어 미리보기를 생성하고, 콜백 함수를 실행합니다.
     * 더 이상 사용되지 않음.
     * @param {File} file 이미지 파일
     * @returns {Promise<string>} Data URL
     */
    async previewFile(file) {
        return new Promise((resolve, reject) => {
            resolve(URL.createObjectURL(file));
        });
    }
}