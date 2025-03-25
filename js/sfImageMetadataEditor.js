/**
 * 파일명 : sfImageMetadataEditor.js
 */
class sfImageMetadataEditor {
    /**
     * 생성자
     * @param {string} targetElementId 타겟 요소 ID
     * @param {sfUiHandler} uiHandler UI 처리 객체
     * @param {sfFileHandler} fileHandler 파일 처리 객체
     * @param {sfXmpHandler} xmpHandler XMP 처리 객체
     */
    constructor(targetElementId, uiHandler, fileHandler, xmpHandler) {
        this.targetElementId = targetElementId;
        this.sfUiHandler = uiHandler;
        this.sfFileHandler = fileHandler;
        this.sfXmpHandler = xmpHandler;
        this.initialize();
    }

    /**
     * 초기화 함수
     * 필요한 DOM 요소들을 생성하고, 이벤트 리스너를 등록합니다.
     */
    async initialize() {
        this.sfUiHandler.showLog('sfImageMetadataEditor 초기화 시작...', 'info');

        // 타겟 요소 검색
        this.targetElement = document.getElementById(this.targetElementId);

        if (!this.targetElement) {
            this.sfUiHandler.showError('타겟 DOM 요소를 찾을 수 없습니다.');
            return;
        }

        // DOM 요소 생성
        this.createElements();

        // XMP 라이브러리 로드 (초기화 시점에 미리 로드)
        try {
            await this.sfXmpHandler.loadXMPLibrary();
        } catch (error) {
            this.sfUiHandler.showError(`XMP 라이브러리 로드 실패: ${error.message}`);
            console.error(`XMP 라이브러리 로드 실패: ${error.message}`, error);
            return; // XMP 라이브러리 로드 실패 시 초기화 중단
        }

        // 이벤트 리스너 등록
        this.setupEventListeners();
    }

    /**
     * DOM 요소 생성 함수
     * 필요한 DOM 요소들을 생성하고 타겟 요소에 추가합니다.
     */
    createElements() {
        // 드롭 영역 생성
        this.dropArea = document.createElement('div');
        this.dropArea.id = 'sf-drop-area';
        this.dropArea.textContent = '여기에 이미지를 드래그 앤 드롭하세요';
        this.targetElement.appendChild(this.dropArea);

        // 파일 입력 요소 생성
        this.imageInput = document.createElement('input');
        this.imageInput.type = 'file';
        this.imageInput.id = 'sf-imageInput';
        this.imageInput.multiple = true;
        this.imageInput.accept = 'image/*';
        this.imageInput.style.display = 'none';
        this.dropArea.appendChild(this.imageInput);

        // 썸네일 컨테이너 생성
        this.thumbnailContainer = document.createElement('div');
        this.thumbnailContainer.id = 'sf-thumbnail-container';
        this.thumbnailContainer.classList.add('sforiginalthumb');
        this.targetElement.appendChild(this.thumbnailContainer);

        // 메타데이터 패널 생성
        this.metadataPanel = document.createElement('div');
        this.metadataPanel.id = 'sf-metadata-panel';
        this.metadataPanel.classList.add('metadata-info');
        this.targetElement.appendChild(this.metadataPanel);
    }

    /**
     * 이벤트 리스너 등록 함수
     * 드래그 앤 드롭, 파일 선택 이벤트에 대한 리스너를 등록합니다.
     */
    setupEventListeners() {
        this.dropArea.addEventListener('dragenter', this.preventDefaults.bind(this), false);
        this.dropArea.addEventListener('dragover', this.preventDefaults.bind(this), false);
        this.dropArea.addEventListener('drop', this.handleDrop.bind(this), false);
        this.dropArea.addEventListener('click', () => this.imageInput.click());
        this.imageInput.addEventListener('change', this.handleFileSelect.bind(this), false);
    }

    /**
     * 기본 이벤트 동작 방지 함수
     * 드래그 앤 드롭 이벤트의 기본 동작을 방지합니다.
     * @param {Event} e 이벤트 객체
     */
    preventDefaults(e) {
        e.preventDefault(); // 이미지가 새 탭으로 열리는 것을 방지
        e.stopPropagation();
    }

    /**
     * 파일 드롭 처리 함수
     * 드롭된 파일들을 처리합니다.
     * @param {Event} e 이벤트 객체
     */
    handleDrop(e) {
        e.preventDefault();
        const dt = e.dataTransfer;
        const files = dt.files;
        this.handleFiles(files);
    }

    /**
     * 파일 선택 처리 함수
     * 선택된 파일들을 처리합니다.
     * @param {Event} e 이벤트 객체
     */
    handleFileSelect(e) {
        const files = e.target.files;
        this.handleFiles(files);
    }

    /**
     * 파일 처리 함수
     * 파일 목록을 순회하며 이미지 파일을 처리하고 썸네일을 표시합니다.
     * @param {FileList} files 파일 목록
     */
    async handleFiles(files) {
        // 썸네일 컨테이너 초기화
        this.thumbnailContainer.innerHTML = '';

        for (const file of files) {
            try {
                await this.createThumbnail(file); // 썸네일 생성 및 추가
            } catch (error) {
                this.sfUiHandler.showError(`썸네일 생성 오류: ${file.name} - ${error.message}`);
                console.error(`썸네일 생성 오류: ${file.name}`, error);
            }
        }
    }

    /**
     * 썸네일 생성 함수
     * 파일로부터 썸네일을 생성하고, 메타데이터 보기 버튼과 함께 썸네일 컨테이너에 추가합니다.
     * @param {File} file 이미지 파일
     */
    async createThumbnail(file) {
        // 썸네일 요소 생성
        const thumbnail = document.createElement('img');
        thumbnail.src = URL.createObjectURL(file); // 원본 파일 URL 사용
        thumbnail.width = 100; // 가로 100px로 고정

        // 메타데이터 보기 버튼 생성
        const metadataButton = document.createElement('button');
        metadataButton.textContent = '메타데이터 보기';
        metadataButton.addEventListener('click', () => this.displayMetadataPanel(file)); // 클릭 이벤트 리스너

        // 썸네일 컨테이너에 썸네일과 버튼 추가
        const thumbnailItem = document.createElement('div'); //썸네일 감싸는 div
        thumbnailItem.appendChild(thumbnail);
        thumbnailItem.appendChild(metadataButton);
        this.thumbnailContainer.appendChild(thumbnailItem);
    }

    /**
     * 메타데이터 표시 함수 (오른쪽 정보 패널에 표시)
     * 추출된 메타데이터를 오른쪽 정보 패널에 표시합니다.
     * @param {File} file 이미지 파일
     */
    async displayMetadataPanel(file) {
        try {
            if (typeof xmp === 'undefined') {
                const errorMessage = 'XMP 라이브러리가 로드되지 않았습니다. 메타데이터 추출을 건너뜁니다.';
                this.sfUiHandler.showWarning(errorMessage);
                console.warn(errorMessage);
                throw new Error('XMP library not loaded');
            }
            // XMP 데이터 추출
            const xmpData = await this.sfXmpHandler.extractMetadata(file); // file을 직접 전달

            // 오른쪽 정보 패널에 표시
            this.displayMetadata(xmpData, file); // file을 직접 전달
        } catch (error) {
            this.sfUiHandler.showError(`메타데이터 추출 오류: ${file.name} - ${error.message}`);
            console.error(`메타데이터 추출 오류: ${file.name}`, error);
        }
    }

    /**
     * 메타데이터 표시 함수
     * 추출된 메타데이터를 표시합니다.
     * @param {string} xmpData 추출된 XMP 데이터
     * @param {File} file 이미지 파일
     */
    displayMetadata(xmpData, file) {
        // 메타데이터 패널 초기화
        this.metadataPanel.innerHTML = '';

        // 제목과 설명 추출
        const title = this.sfXmpHandler.extractValue(xmpData, 'dc:title');
        const description = this.sfXmpHandler.extractValue(xmpData, 'dc:description');

        // 제목 표시
        if (title) {
            const titleElement = document.createElement('p');
            titleElement.textContent = `제목: ${title}`;
            this.metadataPanel.appendChild(titleElement);
        }

        // 설명 표시
        if (description) {
            const descriptionElement = document.createElement('p');
            descriptionElement.textContent = `설명: ${description}`;
            this.metadataPanel.appendChild(descriptionElement);
        }
    }
}