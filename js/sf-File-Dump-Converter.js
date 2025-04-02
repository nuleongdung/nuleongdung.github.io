/**
 * @class sfFileDumpConverter
 * @description 파일 덤프 변환기 클래스
 */
class sfFileDumpConverter {
    /**
     * @constructor
     * @param {string|HTMLElement} element - 클래스를 적용할 HTML 요소 (CSS 선택자 또는 요소 자체)
     */
    constructor(element) {
        // 생성자에 string을 받아서 CSS 선택자인지 HTML 요소인지 판단
        if (typeof element === 'string') {
            // CSS 선택자인 경우, 해당 요소를 찾아서 this.element에 할당
            this.element = document.querySelector(element);
            if (!this.element) {
                // 해당 요소를 찾지 못한 경우, 콘솔에 에러 메시지를 출력하고 함수 종료
                console.error('Element with selector "' + element + '" not found');
                return;
            }
        } else {
            // HTML 요소인 경우, 그대로 this.element에 할당
            this.element = element;
        }

        // DOM 요소 생성
        this.createDom();
    }

    /**
     * @function createDom
     * @description HTML 요소들을 동적으로 생성하여 클래스 요소에 추가
     */
    createDom() {

        // 파일 컨테이너 div 생성
        const fileContainer = document.createElement('div');
        fileContainer.style = "display: flex;flex-direction: column;";
        fileContainer.setAttribute('aria-label', '출력 옵션 선택');

        // 파일 input 과 버튼 컨테이너 div 생성
        const fileInputContainer = document.createElement('div');
        fileInputContainer.style = "display: flex;";

        // fileContainer.appendChild(fileInputContainer);

        // 파일 선택 레이블 생성
        const fileLabel = document.createElement('label');
        fileLabel.setAttribute('for', 'sf-file-upload');
        fileLabel.style.display = 'block';
        fileLabel.style.marginBottom = '5px';
        fileLabel.textContent = '파일 선택:';

        // 파일 선택 입력 필드 생성
        this.fileInput = document.createElement('input');
        this.fileInput.setAttribute('type', 'file');
        this.fileInput.setAttribute('id', 'sf-file-upload');
        this.fileInput.setAttribute('aria-describedby', 'sf-file-upload-desc');
        this.fileInput.style = "width:70%; padding: 10px; border: 1px solid rgb(204, 204, 204); border-radius: 4px;";

        // 변환 버튼 생성
        this.convertButton = document.createElement('button');
        this.convertButton.setAttribute('id', 'sf-convert-button');
        this.convertButton.setAttribute('type', 'button');
        this.convertButton.setAttribute('aria-label', '파일 덤프 변환 시작');
        this.convertButton.style = "background-color: rgb(76, 175, 80); color: white; padding: 12px 20px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;";
        this.convertButton.textContent = '변환';

        // 변환 버튼 클릭 이벤트 리스너 등록
        this.convertButton.addEventListener('click', this.handleConvert.bind(this));

        fileInputContainer.appendChild(this.fileInput);
        fileInputContainer.appendChild(this.convertButton);



        // 파일 설명 div 생성
        this.fileDesc = document.createElement('div');
        this.fileDesc.style = "font-size: 12px; color: rgb(119, 119, 119);";
        this.fileDesc.textContent = '덤프할 파일을 선택또는 드래그 하세요.';


        fileContainer.appendChild(fileInputContainer);
        fileContainer.appendChild(this.fileDesc);

        // fieldsetContainer div 생성
        const fieldsetContainer = document.createElement('div');
        fieldsetContainer.style = "display: flex;flex-flow: row wrap;";
        fieldsetContainer.setAttribute('aria-label', '출력 옵션 선택');

        // 진수 fieldset 생성
        const fieldsetBase = document.createElement('fieldset');
        const legendBase = document.createElement('legend');
        legendBase.setAttribute('for', 'sf-base-select');
        legendBase.textContent = '진수 선택:';

        // 진수 선택 드롭다운 생성
        this.baseSelect = document.createElement('select');
        this.baseSelect.setAttribute('id', 'sf-base-select');
        this.baseSelect.setAttribute('aria-label', '진수 선택');
        this.baseSelect.style = "padding: 10px; border: 1px solid rgb(204, 204, 204); border-radius: 4px; width: 150px;";

        fieldsetBase.appendChild(this.baseSelect);
        fieldsetBase.appendChild(legendBase);


        // 진수 선택 옵션 데이터
        const baseOptions = [
            { value: '8', text: '8진수' },
            { value: '16', text: '16진수', selected: true },
            { value: '32', text: '32진수' }
        ];

        // 진수 선택 옵션 생성 및 드롭다운에 추가
        baseOptions.forEach(optionData => {
            const option = document.createElement('option');
            option.setAttribute('value', optionData.value);
            option.textContent = optionData.text;
            if (optionData.selected) {
                option.setAttribute('selected', 'selected');
            }
            this.baseSelect.appendChild(option);
        });

        // 라인 제한 fieldset 생성
        const fieldsetlineLimit = document.createElement('fieldset');
        const legendlineLimit = document.createElement('legend');
        legendlineLimit.setAttribute('for', 'sf-line-limit-select');
        legendlineLimit.textContent = '출력 라인제한:';

        // 라인 제한 드롭다운 생성
        this.lineLimitSelect = document.createElement('select');
        this.lineLimitSelect.setAttribute('id', 'sf-line-limit-select');
        this.lineLimitSelect.setAttribute('aria-label', '출력 라인 제한 선택');
        this.lineLimitSelect.style = "padding: 10px; border: 1px solid rgb(204, 204, 204); border-radius: 4px; width: 150px;";

        fieldsetlineLimit.appendChild(this.lineLimitSelect);
        fieldsetlineLimit.appendChild(legendlineLimit);

        // 라인 제한 옵션 데이터
        const lineLimitOptions = [
            { value: '10', text: '10 라인', selected: true },
            { value: '20', text: '20 라인' },
            { value: '50', text: '50 라인' },
            { value: '100', text: '100 라인' },
            { value: '0', text: '제한 없음' }
        ];

        // 라인 제한 옵션 생성 및 드롭다운에 추가
        lineLimitOptions.forEach(optionData => {
            const option = document.createElement('option');
            option.setAttribute('value', optionData.value);
            option.textContent = optionData.text;
            if (optionData.selected) {
                option.setAttribute('selected', 'selected');
            }
            this.lineLimitSelect.appendChild(option);
        });



        // 덤프 결과 영역 생성
        this.resultDiv = document.createElement('div');
        this.resultDiv.setAttribute('id', 'sf-result');
        this.resultDiv.style = "margin-top: 20px; padding: 15px; border: 1px solid rgb(221, 221, 221); border-radius: 5px; display: none;";

        // 덤프 결과 제목 생성
        const resultTitle = document.createElement('h2');
        resultTitle.style = "font-size: 18px; margin-bottom: 10px;";
        resultTitle.textContent = '덤프 결과';

        // 덤프 결과 텍스트 영역 생성
        this.resultText = document.createElement('pre');
        this.resultText.setAttribute('id', 'sf-result-text');
        this.resultText.style = "white-space: pre-wrap; word-break: break-all;";

        // 덤프 결과 영역에 제목과 텍스트 영역 추가
        this.resultDiv.appendChild(resultTitle);
        this.resultDiv.appendChild(this.resultText);


        fieldsetContainer.appendChild(fieldsetBase);
        fieldsetContainer.appendChild(fieldsetlineLimit);

        // 요소들을 sf-File-Dump-Converter에 추가


        this.element.appendChild(fileContainer);
        this.element.appendChild(fieldsetContainer);
        this.element.appendChild(this.resultDiv);
    }

    /**
     * @function handleConvert
     * @description 변환 버튼 클릭 시 호출되는 함수
     */
    handleConvert() {
        // 파일 입력 필드에서 선택한 파일 가져오기
        const file = this.fileInput.files[0];
        // 진수 선택 드롭다운에서 선택한 진수 값 가져오기
        const base = parseInt(this.baseSelect.value);
        // 라인 제한 드롭다운에서 선택한 라인 제한 값 가져오기
        const lineLimit = parseInt(this.lineLimitSelect.value);

        // 파일이 선택되지 않은 경우, 경고 메시지 표시하고 함수 종료
        if (!file) {
            // alert('파일을 선택해주세요.');
            this.fileDesc.textContent = '파일을 선택해주세요.';
            return;
        }

        // 파일 덤프 변환
        this.dumpFile(file, base, lineLimit)
            .then(dumpText => {
                // 변환된 덤프 텍스트를 결과 텍스트 영역에 표시
                this.resultText.textContent = dumpText;
                // 결과 영역 표시
                this.resultDiv.style.display = 'block';
            })
            .catch(error => {
                // 에러 발생 시, 경고 메시지 표시
                alert(error);
            });
    }

    /**
     * @function dumpFile
     * @description 파일을 읽어 지정된 진수로 덤프하는 함수
     * @param {File} file - 덤프할 파일
     * @param {number} base - 진수 (8, 16, 32)
     * @param {number} lineLimit - 출력 라인 제한
     * @returns {Promise<string>} - 덤프 텍스트를 담은 Promise
     */
    dumpFile(file, base, lineLimit) {
        // Promise 객체 생성
        return new Promise((resolve, reject) => {
            // FileReader 객체 생성
            const reader = new FileReader();

            // 파일 로드 완료 시 호출되는 이벤트 핸들러
            reader.onload = (event) => {
                // 파일 내용을 ArrayBuffer로 가져오기
                const arrayBuffer = event.target.result;
                // ArrayBuffer를 Uint8Array로 변환
                const uint8Array = new Uint8Array(arrayBuffer);

                // 덤프 텍스트 생성
                let dumpText = '';
                // 출력 라인 수 카운터
                let lineCount = 0;

                // 파일 내용 순회
                for (let i = 0; i < uint8Array.length; i++) {
                    // 주소 (offset) 표시
                    if (i % 16 === 0) {
                        // 현재 인덱스를 16진수로 변환하고 8자리로 패딩
                        const address = i.toString(16).toUpperCase().padStart(8, '0');
                        // 덤프 텍스트에 주소 추가
                        dumpText += address + ': ';
                    }

                    // 바이트 값 가져오기
                    const value = uint8Array[i];
                    let convertedValue;

                    // 32진수인 경우, base32Encode 함수 사용
                    if (base === 32) {
                        convertedValue = this.base32Encode(value);
                    } else {
                        // 그 외의 경우, toString(base) 함수 사용
                        convertedValue = value.toString(base).toUpperCase();
                        // 8진수인 경우, 항상 3자리로 표현
                        if (base === 8) {
                            convertedValue = convertedValue.padStart(3, '0');
                        }
                    }

                    // 덤프 텍스트에 변환된 값 추가
                    dumpText += convertedValue + ' ';

                    // 16바이트마다 줄바꿈
                    if ((i + 1) % 16 === 0) {
                        dumpText += '\n';
                        // 라인 수 증가
                        lineCount++;

                        // 라인 제한이 있고, 라인 수가 제한을 초과한 경우, 루프 종료
                        if (lineLimit > 0 && lineCount >= lineLimit) {
                            break;
                        }
                    }
                }

                // Promise를 성공 상태로 변경하고 덤프 텍스트 전달
                resolve(dumpText);
            };

            // 파일 로드 중 에러 발생 시 호출되는 이벤트 핸들러
            reader.onerror = () => {
                // Promise를 실패 상태로 변경하고 에러 메시지 전달
                reject('파일 읽기 오류');
            };

            // 파일을 ArrayBuffer로 읽기 시작
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * @function base32Encode
     * @description 바이트 값을 Base32 문자열로 인코딩하는 함수
     * @param {number} value - 인코딩할 바이트 값
     * @returns {string} - Base32 문자열
     */
    base32Encode(value) {
        // Base32 문자 집합
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let str = '';
        let bits = value;

        // 1바이트만 처리
        for (let i = 0; i < 1; i++) {
            str += alphabet[bits >> 3];
            str += alphabet[(bits & 0x07) << 2];
        }
        return str;
    }
}