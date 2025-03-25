/**
 * 파일명 : sf-UiHandler.js
 * sfUiHandler 클래스
 * UI 관련 기능을 제공합니다.
 * 로그 영역, 프로그레스 바, 토스트 메시지 등을 관리합니다.
 */
class sfUiHandler {
    constructor(config) {
        // 설정 객체 저장
        this.config = config;

        // DOM 요소 생성
        this.progressBar = this.createProgressBar(); // 파일 처리 진행 상태를 표시할 프로그레스 바.
        this.toastContainer = this.createToastContainer(); // 토스트 메시지를 표시할 컨테이너.

        // DOM 요소 추가
        document.body.appendChild(this.progressBar); // body에 프로그레스 바 추가.
        document.body.appendChild(this.toastContainer); // body에 토스트 컨테이너 추가.

        // 상태 변수 초기화
        this.toastCount = 0; // 현재 표시된 토스트 메시지 개수.

        this.showLog('sfUiHandler 초기화 완료', 'info'); // 초기화 완료 로그 메시지 표시.
    }


    /**
     * 에러 메시지 표시 함수
     * 에러 메시지를 콘솔에 표시합니다.
     * @param {string} message 에러 메시지
     */
    showError(message) {
        console.error(message); // 콘솔에 에러 메시지 출력.
        this.showToast(message, 'error'); // 토스트 메시지로 에러 메시지 표시.
    }

    /**
     * 경고 메시지 표시 함수
     * @param {string} message 경고 메시지
     */
    showWarning(message) {
        this.showToast(message, 'warning'); // 토스트 메시지로 경고 메시지 표시.
    }

    /**
     * 성공 메시지 표시 함수
     * @param {string} message 성공 메시지
     */
    showSuccess(message) {
        this.showToast(message, 'success'); // 토스트 메시지로 성공 메시지 표시.
    }

    /**
     * 사용자 정의 메시지 표시 함수
     * @param {string} message 사용자 정의 메시지
     * @param {string} type 토스트 메시지 타입
     */
    showCustom(message, type) {
        this.showToast(message, type); // 토스트 메시지로 사용자 정의 메시지 표시.
    }

    /**
     * 진행 상태 메시지 표시 함수
     * 진행 상태 메시지를 프로그레스 바에 표시합니다.
     * @param {number} value 진행 상태 값 (0 ~ 100)
     */
    showProgress(value) {
        this.progressBar.value = value; // 프로그레스 바 값 설정.
        this.progressBar.style.display = 'block'; // 프로그레스 바 표시.
    }

    /**
     * 진행 상태 메시지 숨김 함수
     * 진행 상태 메시지를 숨깁니다. (프로그레스 바 숨김)
     */
    hideProgress() {
        this.progressBar.style.display = 'none'; // 프로그레스 바 숨김.
    }
    /**
     * 로그 메시지 표시 함수
     * 로그 메시지를 콘솔에 출력합니다.
     * @param {string} message 로그 메시지
     * @param {string} level 로그 레벨 ('debug', 'info', 'warning', 'error', 'success', 'custom')
     */
    showLog(message, level = 'info') {
        console.log(`[${level.toUpperCase()}] ${message}`);
    }

    /**
     * 토스트 메시지 표시 함수
     * 화면에 토스트 메시지를 표시합니다.
     * @param {string} message 토스트 메시지 내용
     * @param {string} type 토스트 메시지 타입 ('success', 'info', 'warning', 'error', 'custom')
     * @param {number} duration 토스트 메시지 지속 시간 (ms, 기본값: 3000)
     * @param {function} onClick 토스트 메시지 클릭 시 실행할 함수 (선택 사항)
     */
    showToast(message, type = 'info', duration = 3000, onClick = null) {
        // DOM 요소 생성 및 속성 설정
        const toast = document.createElement('div'); // div 요소 생성.
        toast.classList.add('sf-toast'); // 클래스 추가.
        toast.classList.add(`sf-toast-${type}`); // 타입에 따른 클래스 추가.
        toast.textContent = message; // 메시지 설정.
        toast.setAttribute('role', 'alert'); // ARIA 속성 추가 (접근성).
        toast.setAttribute('aria-live', 'polite'); // ARIA 속성 추가 (접근성).

        // 위치 계산
        const verticalOffset = this.toastCount * 60; // 토스트 높이(50px) + 간격(10px).
        toast.style.transform = `translateY(${verticalOffset}px)`; // 위치 설정.

        // 클릭 이벤트 핸들러 추가
        if (onClick) {
            toast.style.cursor = 'pointer'; // 커서 스타일 설정.
            toast.addEventListener('click', onClick); // 클릭 이벤트 리스너 추가.
        }

        // 토스트 메시지 추가
        this.toastContainer.appendChild(toast); // 토스트 컨테이너에 토스트 메시지 추가.
        this.toastCount++; // 토스트 개수 증가.

        // 일정 시간 후 토스트 메시지 제거
        setTimeout(() => {
            toast.style.transition = "opacity 0.5s ease-in-out"; // 트랜지션 효과 설정.
            toast.style.opacity = "0"; // 투명도 설정.
            setTimeout(() => {
                toast.remove(); // 토스트 메시지 제거.
                this.toastCount--; // 토스트 개수 감소.
                this.updateToastPositions(); // 토스트 위치 업데이트.
            }, 500); // transition 시간과 동일하게 설정.
        }, duration);
    }

    /**
     * 토스트 메시지 위치 업데이트 함수
     * 토스트 메시지가 제거될 때 위치를 재정렬합니다.
     */
    updateToastPositions() {
        const toasts = this.toastContainer.querySelectorAll('.sf-toast'); // 모든 토스트 메시지 선택.
        toasts.forEach((toast, index) => {
            const verticalOffset = index * 60; // 위치 계산.
            toast.style.transform = `translateY(${verticalOffset}px)`; // 위치 설정.
        });
    }

    /**
     * 프로그레스 바 생성 함수
     * 진행 상태를 표시할 프로그레스 바를 동적으로 생성합니다.
     * @returns {HTMLProgressElement} 프로그레스 바
     */
    createProgressBar() {
        // DOM 요소 생성 및 스타일 설정
        const progressBar = document.createElement('progress'); // progress 요소 생성.
        progressBar.id = 'sf-progress-bar'; // id 설정.
        progressBar.style.position = 'fixed'; // 위치 고정.
        progressBar.style.top = '0'; // 상단에 위치.
        progressBar.style.left = '0'; // 왼쪽에 위치.
        progressBar.style.width = '100%'; // 가로 폭 100%.
        progressBar.style.height = '10px'; // 높이 설정.
        progressBar.style.zIndex = '1001'; // z-index 설정.
        progressBar.style.display = 'none'; // 초기에는 숨김.
        progressBar.max = 100; // 최대 값 설정.
        progressBar.value = 0; // 초기 값 설정.
        return progressBar; // 프로그레스 바 반환.
    }

    /**
     * 토스트 컨테이너 생성 함수
     * 토스트 메시지를 담을 컨테이너를 생성합니다.
     * @returns {HTMLDivElement} 토스트 컨테이너
     */
    createToastContainer() {
        // DOM 요소 생성 및 스타일 설정
        const container = document.createElement('div'); // div 요소 생성.
        container.id = 'sf-toast-container'; // id 설정.
        container.style.position = 'fixed'; // 위치 고정.
        container.style.top = '20px'; // 상단에서 20px 떨어진 위치.
        container.style.right = '20px'; // 오른쪽에서 20px 떨어진 위치.
        container.style.zIndex = '1002'; // z-index 설정.
        return container; // 토스트 컨테이너 반환.
    }
}