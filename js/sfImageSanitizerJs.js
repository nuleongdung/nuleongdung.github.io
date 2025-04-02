/**
 * @file sfImageSanitizerJs.js
 * @description 이미지 파일에서 XSS 공격 가능성을 검사하는 JavaScript 클래스입니다.
 *              로컬 파일 및 URL로부터 이미지를 분석하고, 악성 코드 패턴을 탐지합니다.
 */

class sfImageSanitizerJs {
    /**
     * @constructor
     * @description sfImageSanitizerJs 클래스의 생성자입니다.
     *              허용되는 MIME 타입, 최대 파일 크기, XSS 패턴 목록을 초기화합니다.
     */
    constructor() {
        /**
         * @property {Array<string>} allowedMimeTypes
         * @description 허용되는 MIME 타입 목록입니다.
         */
        this.allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        /**
         * @property {number} maxFileSize
         * @description 허용되는 최대 파일 크기(바이트 단위)입니다. 기본값은 10MB입니다.
         */
        this.maxFileSize = 10 * 1024 * 1024; // 10MB 제한 (조정 가능)

        /**
         * @property {Array<RegExp>} xssPatterns
         * @description XSS 공격 패턴을 탐지하기 위한 정규식 패턴 목록입니다.
         *              이 목록은 필요에 따라 추가하거나 수정할 수 있습니다.
         */
        this.xssPatterns = [ // 악성 코드 패턴 (추가/수정 가능)
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i, // <script> 태그
            /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/i, // <iframe> 태그
            /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/i, // <object> 태그
            /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/i,   // <embed> 태그
            /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/i,   // <style> 태그
            /javascript:/i, // javascript: URL
            /data:text\/html/i, // data:text/html URL
            /on\w+\s*=/i,       // onXXX= 이벤트 핸들러
            /<img src="x" onerror=".*?"/i, // onerror 속성
            /<body onload=".*?"/i, // onload 속성
            /<svg onload=".*?"/i, // SVG onload 속성
            /expression\(.*?\)/i // CSS expression

        ];
    }

    /**
     * @async
     * @method scan
     * @param {File|string} input - 검사할 파일 객체 또는 이미지 URL입니다.
     * @param {boolean} [isURL=false] - 입력 데이터가 URL인지 여부를 나타내는 boolean 값입니다.
     * @returns {Promise<boolean|string>} - 검사 결과를 나타내는 Promise 객체입니다.
     *                                      성공하면 true, 실패하면 오류 메시지를 반환합니다.
     * @throws {Error} - 파일 타입, 크기, 매직 넘버 검사 실패 시 또는 URL로부터 파일 획득 실패 시 발생합니다.
     * @description 이미지 파일 또는 URL을 받아 XSS 공격 가능성을 검사합니다.
     *              파일 타입, 크기, 매직 넘버를 확인하고, 파일 내용에서 XSS 공격 패턴을 탐지합니다.
     */
    async scan(input, isURL = false) {
        try {
            /** @type {File} */
            let file;

            // 입력 타입에 따라 File 객체 획득
            if (isURL) {
                file = await this.urlToFile(input); // URL을 File 객체로 변환
                if (!file) {
                    throw new Error("URL에서 파일을 가져오는데 실패했습니다.");
                }
            } else {
                file = input; // input은 File 객체
            }

            // 1. 파일 타입 확인
            if (!this.isAllowedMimeType(file.type)) {
                throw new Error(`허용되지 않는 파일 형식입니다: ${file.type}`);
            }

            // 2. 파일 크기 확인
            if (!this.isAllowedFileSize(file.size)) {
                throw new Error(`파일 크기가 제한을 초과합니다: ${file.size} bytes`);
            }

            // 3. 매직 넘버 확인
            const isValidMagicNumber = await this.checkMagicNumber(file);
            if (typeof isValidMagicNumber === 'string') {
                throw new Error(`파일 내용이 예상되는 형식이 아닙니다: ${isValidMagicNumber}`);
            }
            if (!isValidMagicNumber) {
                throw new Error("파일 내용이 예상되는 형식이 아닙니다.");
            }

            // 4. 파일 내용 스캔
            const fileContent = await this.readFileContent(file);
            const xssResult = this.containsXSS(fileContent);
            if (xssResult) {
                const escapedContent = this.escapeHTML(fileContent.substring(xssResult.index, xssResult.index + 100));
                throw new Error(`XSS 공격 패턴이 발견되었습니다: ${xssResult.pattern}, 위치: ${xssResult.index}, 주변 내용: ${escapedContent}...`);
            }

            return true; // 모든 검사 통과
        } catch (error) {
            console.error("XSS 스캔 실패:", error);
            return error.message; // 스캔 실패 이유 반환
        }
    }

    /**
     * @method isAllowedMimeType
     * @param {string} mimeType - 확인할 MIME 타입입니다.
     * @returns {boolean} - MIME 타입이 허용 목록에 있으면 true, 그렇지 않으면 false를 반환합니다.
     * @description 주어진 MIME 타입이 허용 목록에 있는지 확인합니다.
     */
    isAllowedMimeType(mimeType) {
        return this.allowedMimeTypes.includes(mimeType);
    }

    /**
     * @method isAllowedFileSize
     * @param {number} fileSize - 확인할 파일 크기(바이트 단위)입니다.
     * @returns {boolean} - 파일 크기가 제한 크기 이하이면 true, 그렇지 않으면 false를 반환합니다.
     * @description 주어진 파일 크기가 허용된 최대 파일 크기 이하인지 확인합니다.
     */
    isAllowedFileSize(fileSize) {
        return fileSize <= this.maxFileSize;
    }

    /**
     * @async
     * @method checkMagicNumber
     * @param {File} file - 검사할 파일 객체입니다.
     * @returns {Promise<boolean|string>} - 매직 넘버가 유효하면 true, 그렇지 않으면 오류 메시지를 반환하는 Promise 객체입니다.
     * @description 파일의 매직 넘버를 확인하여 파일 형식을 검증합니다.
     */
    async checkMagicNumber(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                const arr = (new Uint8Array(event.target.result)).subarray(0, 8);
                let header = "";
                for (let i = 0; i < arr.length; i++) {
                    header += arr[i].toString(16).padStart(2, '0');
                }

                console.log("Magic Number:", header);

                if (header.startsWith("ffd8ffe0") || header.startsWith("ffd8ffe1")) {
                    resolve(true);
                } else if (header.startsWith("89504e47")) {
                    resolve(true);
                } else if (header.startsWith("52494646") && header.includes("57454250")) {
                    resolve(true);
                } else if (header.startsWith("47494638")) {
                    resolve(false); // 우선 false 처리
                } else {
                    resolve("알 수 없는 파일 형식");
                }
            };
            reader.onerror = function (event) {
                reject("파일 읽기 오류");
            };
            reader.readAsArrayBuffer(file.slice(0, 8));
        });
    }

    /**
     * @method readFileContent
     * @param {File} file - 읽을 파일 객체입니다.
     * @returns {Promise<string>} - 파일 내용을 담은 문자열을 반환하는 Promise 객체입니다.
     * @description 파일의 내용을 텍스트 문자열로 읽어옵니다.
     */
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                resolve(event.target.result);
            };
            reader.onerror = function (event) {
                reject("파일 읽기 오류");
            };
            reader.readAsText(file);
        });
    }

    /**
     * @method containsXSS
     * @param {string} fileContent - 검사할 파일 내용입니다.
     * @returns {boolean|object} - XSS 패턴이 발견되면 해당 패턴과 위치 정보를 담은 객체를 반환하고,
     *                            그렇지 않으면 false를 반환합니다.
     * @description 파일 내용에서 XSS 공격 패턴을 탐지합니다.
     */
    containsXSS(fileContent) {
        for (const pattern of this.xssPatterns) {
            const match = pattern.exec(fileContent);
            if (match) {
                console.warn("XSS 패턴 발견:", pattern);
                return {
                    pattern: pattern.toString(),
                    index: match.index
                };
            }
        }
        return false;
    }

    /**
     * @method escapeHTML
     * @param {string} str - HTML 엔티티로 이스케이프할 문자열입니다.
     * @returns {string} - HTML 엔티티로 이스케이프된 문자열을 반환합니다.
     * @description HTML 엔티티를 이스케이프하여 XSS 공격을 방지합니다.
     */
    escapeHTML(str) {
        let entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;'
        };
        return String(str).replace(/[&<>"'/]/g, function (s) {
            return entityMap[s];
        });
    }

    /**
     * @async
     * @method urlToFile
     * @param {string} url - 변환할 이미지 URL입니다.
     * @returns {Promise<File|null>} - URL로부터 생성된 File 객체를 반환하는 Promise 객체입니다.
     * @description 주어진 URL로부터 File 객체를 생성합니다.
     */
    async urlToFile(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const file = new File([blob], "image.jpg", { type: blob.type });
            return file;
        } catch (error) {
            console.error("URL에서 파일을 가져오는 중 오류 발생:", error);
            return null;
        }
    }
}

/**
 * @example
 * // sfImageSanitizerJs 클래스 사용 예시
 * const sanitizer = new sfImageSanitizerJs();
 * 
 * // 파일 객체를 사용하여 XSS 검사
 * const fileInput = document.getElementById('fileInput');
 * const file = fileInput.files[0];
 * 
 * sanitizer.scan(file)
 *   .then(result => {
 *     if (result === true) {
 *       console.log('XSS 스캔 통과: 안전한 파일입니다.');
 *     } else {
 *       console.warn('XSS 스캔 실패:', result);
 *     }
 *   })
 *   .catch(error => {
 *     console.error('XSS 스캔 오류:', error);
 *   });
 * 
 * @example
 * // URL을 사용하여 XSS 검사
 * const imageUrl = 'http://example.com/image.jpg';
 * 
 * sanitizer.scan(imageUrl, true)
 *   .then(result => {
 *     if (result === true) {
 *       console.log('XSS 스캔 통과: 안전한 URL입니다.');
 *     } else {
 *       console.warn('XSS 스캔 실패:', result);
 *     }
 *   })
 *   .catch(error => {
 *     console.error('XSS 스캔 오류:', error);
 *   });
 */