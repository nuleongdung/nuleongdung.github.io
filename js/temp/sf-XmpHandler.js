/**
 * 파일명 : sf-XmpHandler.js
 */
class sfXmpHandler {
    /**
     * 생성자
     * @param {sfUiHandler} uiHandler UI 처리 객체
     * @param {object} config 설정 객체
     */
    constructor(uiHandler, config) {
        this.uiHandler = uiHandler;
        this.sfSanitizeXMPData = new sfSanitizeXMPData(); // sfSanitizeXMPData 인스턴스 생성
        this.config = config; // 설정 객체 저장
    }

    /**
     * 메타데이터 추출 함수
     * 이미지 파일에서 메타데이터를 추출합니다.
     * @param {File} file 이미지 파일
     * @returns {Promise<string>} XMP 데이터 (XML 문자열)
     */
    async extractMetadata(file) {
        return new Promise((resolve, reject) => {
            try {
                if (typeof xmp === 'undefined') {
                    const errorMessage = 'XMP 라이브러리가 로드되지 않았습니다. 메타데이터 추출을 건너뜁니다.';
                    this.uiHandler.showWarning(errorMessage);
                    console.warn(errorMessage);
                    reject(new Error('XMP library not loaded'));
                    return;
                }

                // FileReader를 사용하여 파일 읽기
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        // xmp 객체 재확인 (혹시 모를 race condition 대비)
                        if (typeof xmp === 'undefined') {
                            const errorMessage = 'XMP 라이브러리가 로드되지 않았습니다. 메타데이터 추출을 건너뜁니다.';
                            this.uiHandler.showWarning(errorMessage);
                            console.warn(errorMessage);
                            reject(new Error('XMP library not loaded'));
                            return;
                        }

                        const xmpData = window.xmp.extractXMP(event.target.result); // ArrayBuffer를 xmp.extractXMP에 전달

                        if (xmpData) {
                            console.debug('XMP Data:', xmpData);
                            this.uiHandler.showLog('XMP Data 추출 성공', 'info');
                            resolve(xmpData);
                        } else {
                            const errorMessage = 'XMP 데이터를 찾을 수 없습니다.';
                            this.uiHandler.showWarning(errorMessage);
                            console.warn(errorMessage);
                            reject(new Error('No XMP data found'));
                        }
                    } catch (error) {
                        const errorMessage = `XMP 데이터 추출 중 오류 발생: ${error.message}`;
                        this.uiHandler.showError(errorMessage);
                        console.error(errorMessage, error);
                        reject(error);
                    }
                };
                reader.onerror = (error) => {
                    const errorMessage = `파일 읽기 오류: ${error.message}`;
                    this.uiHandler.showError(errorMessage);
                    console.error(errorMessage, error);
                    reject(error);
                };
                reader.readAsArrayBuffer(file); // 파일을 ArrayBuffer로 읽기
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * XMP 데이터에서 특정 값 추출 함수
     * XMP 데이터에서 특정 태그의 값을 추출합니다.
     * @param {string} xmpData XMP 데이터
     * @param {string} tag 추출할 태그 이름
     * @returns {string | null} 추출된 값 또는 null
     */
    extractValue(xmpData, tag) {
        try {
            // 1. XMP 데이터 소독
            const sanitizedXMPData = this.sfSanitizeXMPData.sanitize(xmpData); // sfSanitizeXMPData.sanitize() 호출

            // 2. XML 파싱
            const parser = new DOMParser(); // DOMParser 객체 생성.
            const xmlDoc = parser.parseFromString(sanitizedXMPData, 'text/xml'); // XML 파싱.

            // 3. 태그 선택
            const element = xmlDoc.querySelector(tag); // 해당 태그 선택.

            // 4. 값 추출 및 반환
            return element ? element.textContent : null; // 값 추출 및 반환.
        } catch (error) {
            this.uiHandler.showError(`XMP 값 추출 중 오류 발생: ${error.message}`); // 에러 메시지 표시.
            console.error(`XMP 값 추출 중 오류 발생: ${error.message}`, error); // 에러 메시지 로깅.
            return null; // null 반환.
        }
    }

    /**
     * XMP 라이브러리 동적 로드 함수
     * XMP 라이브러리가 없는 경우 동적으로 로드합니다.
     */
    loadXMPLibrary() {
        return new Promise((resolve, reject) => {
            if (typeof xmp !== 'undefined') {
                console.log('XMP 라이브러리가 이미 로드되어 있습니다.'); // 로그 메시지 출력.
                this.uiHandler.showLog('XMP 라이브러리가 이미 로드되어 있습니다.', 'info'); // 로그 메시지 표시.
                resolve(); // resolve 호출.
                return;
            }

            // script 요소 생성 및 속성 설정
            const script = document.createElement('script'); // script 요소 생성.
            script.src = this.config.xmpCdnUrl; // CDN URL 설정.

            // 이벤트 리스너 등록
            script.onload = () => {
                console.log('XMP 라이브러리 로드 완료.'); // 로그 메시지 출력.
                this.uiHandler.showLog('XMP 라이브러리 로드 완료.', 'info'); // 로그 메시지 표시.
                // xmp 객체 사용 가능 여부 확인 후 resolve
                if (typeof xmp !== 'undefined') {
                    resolve();
                } else {
                    const errorMessage = 'XMP 라이브러리 로드 실패: xmp 객체를 사용할 수 없습니다.';
                    this.uiHandler.showError(errorMessage);
                    console.error(errorMessage);
                    reject(new Error(errorMessage));
                }
            };
            script.onerror = () => {
                const errorMessage = 'XMP 라이브러리 로드 실패. Fallback URL 시도.'; // 에러 메시지 생성.
                this.uiHandler.showError(errorMessage); // 에러 메시지 표시.
                console.error(errorMessage); // 에러 메시지 로깅.
                this.loadFallbackXMPLibrary().then(resolve).catch(reject); // Fallback 로드 후 resolve 또는 reject.
            };

            // script 요소 추가
            document.head.appendChild(script); // head에 script 요소 추가.
        });
    }

    /**
     * Fallback XMP 라이브러리 로드 함수
     * CDN 로드에 실패할 경우 Fallback URL을 사용하여 XMP 라이브러리를 로드합니다.
     */
    loadFallbackXMPLibrary() {
        return new Promise((resolve, reject) => {
            // script 요소 생성 및 속성 설정
            const script = document.createElement('script'); // script 요소 생성.
            script.src = this.config.xmpFallbackUrl; // Fallback URL 설정.

            // 이벤트 리스너 등록
            script.onload = () => {
                console.log('Fallback XMP 라이브러리 로드 완료.'); // 로그 메시지 출력.
                this.uiHandler.showLog('Fallback XMP 라이브러리 로드 완료.', 'info'); // 로그 메시지 표시.
                // xmp 객체 사용 가능 여부 확인 후 resolve
                if (typeof xmp !== 'undefined') {
                    resolve();
                } else {
                    const errorMessage = 'Fallback XMP 라이브러리 로드 실패: xmp 객체를 사용할 수 없습니다.';
                    this.uiHandler.showError(errorMessage);
                    console.error(errorMessage);
                    reject(new Error(errorMessage));
                }
            };
            script.onerror = () => {
                const errorMessage = 'Fallback XMP 라이브러리 로드 실패.'; // 에러 메시지 생성.
                this.uiHandler.showError(errorMessage); // 에러 메시지 표시.
                console.error(errorMessage); // 에러 메시지 로깅.
                reject(new Error('Failed to load fallback XMP library')); // reject 호출.
            };

            // script 요소 추가
            document.head.appendChild(script); // head에 script 요소 추가.
        });
    }
}