/**
 * sfTistoryToc 클래스
 * 티스토리 블로그 글에 자동으로 목차를 생성하고 관리하는 클래스입니다.
 */
class sfTistoryToc {
    /**
     * 생성자
     * 클래스 인스턴스를 생성하고 초기 설정을 수행합니다.
     * @param {Object} options - 사용자 정의 설정 옵션
     */
    constructor(options = {}) {
        // 기본 설정
        this.settings = {
            tocContainerId: 'sf-tistory-toc', // TOC 컨테이너의 HTML ID
            articleViewId: 'article-view', // 글 본문 영역의 HTML ID
            headingsTargetClass: 'tt_article_useless_p_margin', // 제목을 검색할 상위 요소의 클래스
            headingSelector: `h2, h3, h4`, // 제목 선택자
            tocListClass: 'sf-toc-list', // TOC 목록(ul)의 클래스 이름
            tocItemClass: 'sf-toc-item', // TOC 항목(li)의 클래스 이름
            sfTocOpenClass: 'sf-toc-open', // TOC를 활성화하는 클래스
            sfTocFocusClass: 'sf-toc-focus', // 현재 보고 있는 제목에 포커스를 주기 위한 클래스
            focusOffset: 300, // 스크롤 시 제목 위치를 조정하기 위한 오프셋 (픽셀 단위)
            minPageWidth: 1000, // TOC가 활성화될 최소 페이지 너비 (픽셀 단위)
            sfHeadingTitleClass: 'sf-heading-title', // TOC 제목 (h1)을 감싸는 요소의 클래스
            h1HeadingTitleClass: 'sf-heading-title h1', // TOC 제목 (h1)에 적용할 클래스
            sfTocToggleClass: 'sf-toc-toggle', // 하위 목록 토글 버튼의 클래스
            headingWrapperTag: 'div', // 제목 텍스트를 감싸는 HTML 태그 (div 또는 button)
            headingWrapperClass: 'heading-title', // 제목 텍스트를 감싸는 HTML 요소의 클래스
            sfHeadingWrapperClass: 'sf-heading-title', // 제목 텍스트를 감싸는 HTML 요소에 적용할 클래스 접두사
            toggleButtonTag: 'span', // 토글 버튼을 감싸는 HTML 태그 (기본값: 'span')
            sfTocToggleCloseClass: 'sf-toc-toggle-close', // 토글 버튼 닫힘 상태 클래스
            sfTocToggleOpenClass: 'sf-toc-toggle-open', // 토글 버튼 열림 상태 클래스
            tocBodyClass: 'sf-toc-body' // TOC 전체를 감싸는 요소의 클래스
        };

        // 사용자 정의 옵션 병합 (기본 설정 덮어쓰기)
        Object.assign(this.settings, options);

        // 수동 포커스 모드 (클릭 시 스크롤 방지)
        this.manualFocus = false;

        // 초기화 함수 호출
        this.init();
    }

    /**
     * 초기화 함수
     * 페이지 로드 시 TOC를 생성하거나 제거할지 결정합니다.
     */
    init() {
        this.checkAndRun(); // 초기 실행

        // 창 크기 변경 시 checkAndRun 함수 호출 (debounce 적용)
        window.addEventListener('resize', this.debounce(() => {
            this.checkAndRun();
        }, 250));
    }

    /**
     * Debounce 함수
     * 함수 호출 빈도를 제한합니다.
     * @param {Function} func - Debounce할 함수
     * @param {number} delay - 딜레이 시간 (밀리초)
     * @returns {Function} - Debounce된 함수
     */
    debounce(func, delay) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    /**
     * 페이지 너비 확인 후 TOC 실행/중단
     * 현재 페이지 너비를 확인하여 TOC를 생성하거나 제거합니다.
     */
    checkAndRun() {
        // 페이지 너비가 최소 너비보다 크거나 같은 경우
        if (window.innerWidth >= this.settings.minPageWidth) {
            // 'sf-toc-open' 클래스가 있는지 확인
            if (!document.querySelector(`.${this.settings.sfTocOpenClass}`)) {
                console.error(`'${this.settings.sfTocOpenClass}' 클래스가 없어 TOC를 생성하지 않습니다.`);
                return;
            }

            // TOC가 이미 생성되었는지 확인
            if (document.getElementById(this.settings.tocContainerId)) {
                console.warn("TOC가 이미 존재합니다. 생성을 건너뜁니다...");
                return;
            }

            // TOC 컨테이너 생성 및 TOC 생성
            if (this.createTocContainer()) {
                this.generateToc();
            }
        } else {
            // 페이지 너비가 좁으면 TOC 제거
            this.destroyToc();
        }
    }

    /**
     * TOC 컨테이너 생성
     * TOC를 삽입할 컨테이너 요소를 생성합니다.
     */
    createTocContainer() {
        // TOC를 삽입할 위치 찾기
        this.contentInner = document.querySelector(`#content .inner`); // 멤버변수로 등록
        if (!this.contentInner) return false;

        // TOC 컨테이너 생성 (aside 태그 사용)
        const tocContainer = document.createElement('aside');
        tocContainer.id = this.settings.tocContainerId;
        this.contentInner.appendChild(tocContainer);
        return true;
    }

    /**
     * TOC 제거
     * TOC 컨테이너를 제거합니다.
     */
    destroyToc() {
        const tocContainer = document.getElementById(this.settings.tocContainerId);
        if (tocContainer) tocContainer.remove();
    }

    /**
     * TOC 생성
     * TOC의 전체 구조를 생성합니다.
     */
    generateToc() {
        // 컨테이너와 본문 요소 가져오기
        const tocContainer = document.getElementById(this.settings.tocContainerId);
        this.articleView = document.getElementById(this.settings.articleViewId); // 멤버 변수로 등록
        if (!this.articleView) {
            console.error('articleView 를 찾을 수 없습니다.');
            return false; // 실패 반환
        }

        // 제목 검색 대상 요소 가져오기
        this.headingsTarget = this.articleView.querySelector(`.${this.settings.headingsTargetClass}`); // 멤버 변수로 등록
        if (!this.headingsTarget) return false;

        // h2, h3, h4 제목 선택
        let headings = this.headingsTarget.querySelectorAll(this.settings.headingSelector);
        if (headings.length === 0) return false;

        // 마지막 요소 제거
        if (headings.length > 0) {
            headings = Array.from(headings).slice(0, headings.length - 1);
        }

        // TOC 목록 생성
        const tocList = document.createElement('ul');
        tocList.classList.add(this.settings.tocListClass);

        // 제목 계층 구조화
        const structuredHeadings = this.structureHeadings(headings);
        // TOC 목록 생성 (재귀 호출)
        this.generateTocList(structuredHeadings, tocList);

        // TOC 제목 생성
        let tocTitle = document.createElement('div');
        tocTitle.className = this.settings.h1HeadingTitleClass; // 설정된 클래스 사용
        tocTitle.dataset.sfTocheading = 'h1';
        tocTitle.title = "테스팅 페이지"; // 기본 제목

        const h1Elements = this.articleView.querySelectorAll('h1');

        // h1 태그가 있으면 내용 가져오기
        if (h1Elements.length > 0) {
            tocTitle.title = h1Elements[0].textContent;
            tocTitle.textContent = h1Elements[0].textContent; // 글 제목으로 변경
        }

        // TOC 본문 생성
        const tocBody = document.createElement('div');
        tocBody.classList.add(this.settings.tocBodyClass); // sf-toc-body 클래스 사용
        tocBody.appendChild(tocTitle);
        tocBody.appendChild(tocList);

        // TOC 컨테이너에 본문 추가
        if (tocContainer) {
            tocContainer.appendChild(tocBody);

            // 스크롤 이벤트 리스너 추가
            this.attachScrollEventListener(tocContainer);
        }

        return true;
    }

    /**
     * 스크롤 이벤트 리스너 추가
     * 스크롤 시 포커스를 표시하기 위한 이벤트 리스너를 추가합니다.
     */
    attachScrollEventListener(tocContainer) {
        let ticking = false; // 스크롤 이벤트 throttling
        const handleScroll = () => {
            if (!ticking && !this.manualFocus) {
                ticking = true;
                requestAnimationFrame(() => {
                    this.checkFocus(tocContainer); // 현재 위치에 따라 포커스 변경
                    ticking = false;
                });
            }
        };
        window.addEventListener('scroll', handleScroll); // 스크롤 이벤트에 함수 연결
    }

    /**
     * 현재 위치 확인
     * 현재 화면에 보이는 제목을 확인하고 TOC에 포커스를 설정합니다.
     */
    checkFocus(tocContainer) {
        if (!this.articleView) return;
        if (!this.headingsTarget) return;

        const headings = this.headingsTarget.querySelectorAll(this.settings.headingSelector);
        if (!headings.length) return;

        let closestHeading = null; // 가장 가까운 제목
        let closestDistance = Infinity; // 가장 가까운 거리
        const windowHeight = window.innerHeight; // 창 높이
        const focusThreshold = windowHeight / 2; // 포커스 기준점 (창 높이의 절반)

        // 모든 제목을 순회하며 가장 가까운 제목 찾기
        headings.forEach(heading => {
            const rect = heading.getBoundingClientRect(); // 제목의 위치 정보
            const distance = Math.abs(rect.top - focusThreshold); // 포커스 기준점과의 거리

            // 현재까지 가장 가까운 제목보다 더 가까운 경우
            if (distance < closestDistance) {
                closestDistance = distance; // 거리 업데이트
                closestHeading = heading; // 제목 업데이트
            }
        });

        // TOC에 포커스 설정
        this.setTocFocus(tocContainer, closestHeading);
    }

    /**
     * TOC 포커스 설정
     * TOC에서 특정 제목에 포커스를 설정합니다.
     */
    setTocFocus(tocContainer, closestHeading) {
        const tocItems = tocContainer.querySelectorAll('.' + this.settings.tocItemClass);
        tocItems.forEach(item => {
            item.classList.remove(this.settings.sfTocFocusClass);
        });

        // 가장 가까운 제목이 존재하는 경우
        if (closestHeading) {
            // 해당 제목의 sfIdx 값을 가져옴
            const sfIdx = closestHeading.dataset.sftocid;
            // TOC에서 해당 sfIdx 값을 가진 항목 찾기
            const focusedItem = tocContainer.querySelector(`[data-sf-idx="${sfIdx}"]`);

            // 해당 항목이 존재하는 경우
            if (focusedItem) {
                // 해당 항목에 포커스 클래스 추가
                focusedItem.classList.add(this.settings.sfTocFocusClass);

                // 부모 ul 요소들을 모두 펼치기
                let parent = focusedItem.parentNode;
                while (parent && parent.tagName === 'UL') {
                    const listItem = parent.parentNode;
                    if (listItem && listItem.classList.contains(this.settings.tocItemClass)) {
                        const toggleButton = listItem.querySelector('.' + this.settings.sfTocToggleClass);
                        if (toggleButton) {
                            toggleButton.classList.remove(this.settings.sfTocToggleCloseClass);
                            toggleButton.classList.add(this.settings.sfTocToggleOpenClass);
                        }
                        parent.style.display = 'block';
                    }
                    parent = listItem.parentNode;
                }
            }
        }
    }

    /**
     * 제목 목록 계층 구조화
     * 제목 목록을 계층 구조로 변환합니다.
     */
    structureHeadings = (headings) => {
        const structuredHeadings = [];
        let currentH2 = null;
        let currentH3 = null;

        headings.forEach(heading => {
            switch (heading.tagName) {
                case 'H2':
                    currentH2 = {
                        element: heading,
                        children: []
                    };
                    structuredHeadings.push(currentH2);
                    currentH3 = null;
                    break;
                case 'H3':
                    let parent = currentH2 ? currentH2.children : structuredHeadings;
                    currentH3 = {
                        element: heading,
                        children: []
                    };
                    parent.push(currentH3);
                    break;
                case 'H4':
                    let h4Parent = currentH3 ? currentH3.children : (currentH2 ? currentH2.children : structuredHeadings);
                    h4Parent.push({
                        element: heading,
                        children: []
                    });
                    break;
            }
        });

        return structuredHeadings;
    }

    /**
     * TOC 목록 생성 (재귀)
     * 계층 구조를 기반으로 실제 TOC 목록을 생성합니다.
     */
    generateTocList = (structuredHeadings, parentElement, parentIndex = '') => {
        // 계층 구조를 순회하며 TOC 목록 생성
        structuredHeadings.forEach((heading, index) => {
            // 현재 항목의 인덱스 생성 (상위 인덱스를 기반으로)
            const currentIndex = parentIndex ? `${parentIndex}-${index + 1}` : (index + 1).toString();

            // 제목 요소에 data-sftocid 속성 추가 (TOC에서 스크롤 위치 찾기 위해)
            heading.element.dataset.sftocid = currentIndex;

            // TOC 항목(li) 생성
            const listItem = document.createElement('li');
            listItem.classList.add(this.settings.tocItemClass); // 클래스 추가
            listItem.dataset.sfIdx = currentIndex; // data-sf-idx 속성 추가

            // data-sf-tocheading 속성 추가 (h2, h3, h4)
            listItem.dataset.sfTocheading = heading.element.tagName.toLowerCase();

            // title 속성 추가 (툴팁)
            listItem.title = heading.element.textContent;

            // 하위 목록이 있는 경우 토글 버튼 생성
            let toggleButton = null;
            if (heading.children.length > 0) {
                toggleButton = document.createElement(this.settings.toggleButtonTag); // 토글 버튼 요소 생성, span or div
                toggleButton.classList.add(this.settings.sfTocToggleClass); // 토글 클래스 사용
                toggleButton.classList.add(this.settings.sfTocToggleCloseClass); // 닫힘 클래스 추가
                toggleButton.textContent = ' '; // 텍스트 내용 추가 (CSS로 아이콘 표시)
            }

            // heading 텍스트를 감싸는 요소 생성 (div 또는 button)
            const headingWrapper = document.createElement(this.settings.headingWrapperTag);
            headingWrapper.className = this.settings.sfHeadingWrapperClass;

            // 클릭 이벤트 리스너 추가
            headingWrapper.addEventListener('click', (event) => {
                this.manualFocus = true; // 수동 포커스 설정
                this.scrollToHeading(heading.element); // 해당 heading으로 스크롤
                this.setTocFocus(document.getElementById(this.settings.tocContainerId), heading.element); // 클릭한 heading element 전달
                setTimeout(() => {
                    this.manualFocus = false;
                }, 300); //0.3초후 수동포커스 해제
                event.preventDefault(); // 기본 이벤트 막기
            });

            headingWrapper.append(heading.element.textContent); // 제목 텍스트 추가

            // 토글 버튼을 먼저 추가한 다음 제목 래퍼 추가
            if (toggleButton) {
                listItem.appendChild(toggleButton);
            }
            listItem.appendChild(headingWrapper); // TOC 항목에 추가

            // 토글 버튼 클릭 이벤트 리스너 추가
            if (toggleButton) {
                toggleButton.addEventListener('click', (event) => {
                    const subList = listItem.querySelector('ul'); // 하위 목록 선택
                    if (subList) {
                        // 하위 목록의 표시 상태 토글
                        subList.style.display = subList.style.display === 'none' ? 'block' : 'none';

                        // 토글 버튼의 클래스 토글
                        if (toggleButton.classList.contains(this.settings.sfTocToggleCloseClass)) {
                            toggleButton.classList.remove(this.settings.sfTocToggleCloseClass);
                            toggleButton.classList.add(this.settings.sfTocToggleOpenClass);
                        } else {
                            toggleButton.classList.remove(this.settings.sfTocToggleOpenClass);
                            toggleButton.classList.add(this.settings.sfTocToggleCloseClass);
                        }
                    }
                    event.stopPropagation(); // 상위로 이벤트 전파 중단
                });
            }

            parentElement.appendChild(listItem);

            // 하위 목록이 있는 경우 재귀 호출
            if (heading.children.length > 0) {
                const subList = document.createElement('ul'); // 하위 목록(ul) 생성
                listItem.appendChild(subList); // TOC 항목에 추가
                this.generateTocList(heading.children, subList, currentIndex); // 재귀 호출
                subList.style.display = 'none'; // 초기 상태: 닫힘
            }
        });
    }

    /**
     * 해당 heading으로 스크롤
     * 지정된 heading 요소로 부드럽게 스크롤합니다.
     */
    scrollToHeading(heading) {
        const offset = this.settings.focusOffset;
        const elementPosition = heading.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth" // 부드러운 스크롤
        });
    }
}

/**
 * DOMContentLoaded 이벤트 리스너
 * DOMContentLoaded 이벤트가 발생하면 sfTistoryToc 클래스를 인스턴스화합니다.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 'sf-toc-open' 클래스를 가진 요소가 있는지 확인
    if (document.querySelector('.sf-toc-open')) {
        // 사용자 정의 옵션을 사용하여 sfTistoryToc 인스턴스 생성
        const toc = new sfTistoryToc();
    }
});