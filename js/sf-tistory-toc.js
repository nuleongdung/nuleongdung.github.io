class sfTistoryToc {
    constructor() {
        // TOC 컨테이너의 ID (HTML에 삽입될 위치)
        this.tocContainerId = 'sf-tistory-toc';
        // 글 본문의 ID (목차를 생성할 기준)
        this.articleViewId = 'article-view';
        // 본문에서 제목을 찾을 영역의 클래스 이름
        this.headingsTargetClass = 'tt_article_useless_p_margin';
        // TOC를 감싸는 Wrapper 클래스 이름
        this.tocWrapperClass = 'sf-toc-wrapper';
        // TOC 목록(ul)의 클래스 이름
        this.tocListClass = 'sf-toc-list';
        // TOC 항목(li)의 클래스 이름
        this.tocItemClass = 'sf-toc-item';
        // TOC 링크(a)의 클래스 이름 (사용하지 않음)
        this.tocLinkClass = 'sf-toc-link';
        // 제목을 선택할 CSS 선택자 (h2, h3, h4 사용)
        this.headingSelector = `#${this.articleViewId} h2, #${this.articleViewId} h3, #${this.articleViewId} h4`;
        // 하위 목록을 열 때 사용할 클래스 이름
        this.sfTocOpenClass = 'sf-toc-open';
        // 현재 보고 있는 제목에 포커스 주기 위한 클래스 이름
        this.sfTocFocusClass = 'sf-toc-focus';
        // 포커스 위치를 계산할 때 offset 값 (스크롤 위치 조정)
        this.focusOffset = 100;

        // TOC가 활성화될 최소 페이지 너비 (px)
        this.minPageWidth = 1000; // 기본값: 1000px

        // 새로 추가한 클래스 이름 정의
        this.sfHeadingTitleClass = 'sf-heading-title'; // 제목 클래스 이름
        this.sfTocToggleClass = 'sf-toc-toggle'; // 토글 버튼 클래스 이름

        // 설정 가능한 옵션
        this.headingWrapperTag = 'div'; // 제목을 감싸는 태그 이름 (div 또는 button)
        this.headingWrapperClass = 'heading-title'; // 제목을 감싸는 요소의 클래스 이름
        this.sfHeadingWrapperClass = 'sf-' + this.headingWrapperClass; // sf-heading-title 로 변경
        this.manualFocus = false; // 수동 포커스 여부
        this.toggleButtonTag = 'span'; // 토글 버튼을 감싸는 태그 이름 (기본값: span)
        this.sfTocToggleCloseClass = 'sf-toc-toggle-close'; // 토글 닫힘 클래스
        this.sfTocToggleOpenClass = 'sf-toc-toggle-open';  // 토글 열림 클래스
        this.tocBodyClass = 'sf-toc-body'; // TOC 본문 클래스 이름

        // 초기화 함수 호출
        this.init();
    }

    // 초기화 함수
    init() {
        // 초기 페이지 로드 시 및 리사이즈 시 TOC 생성/제거 결정
        this.checkAndRun();

        // 창 크기가 변경될 때마다 checkAndRun 함수 실행
        window.addEventListener('resize', () => {
            this.checkAndRun();
        });
    }

    // TOC 생성/제거 여부를 결정하는 함수
    checkAndRun() {
        // 현재 페이지 너비가 최소 너비보다 크거나 같은 경우
        if (window.innerWidth >= this.minPageWidth) {
            // HTML에 'sf-toc-open' 클래스가 있는지 확인 (없으면 TOC 생성 안 함)
            if (!document.querySelector('.sf-toc-open')) {
                console.error(".sf-toc-open 클래스가 없어 TOC를 생성하지 않습니다.");
                return;
            }

            // 이미 TOC가 생성되었는지 확인 (중복 생성 방지)
            if (document.getElementById(this.tocContainerId)) {
                console.warn("TOC가 이미 존재합니다. 생성을 건너뜁니다...");
                return;
            }
            // TOC 컨테이너 생성
            if (this.createTocContainer()) {
                // 목차 생성
                this.generateToc();
            }
        }
        // 현재 페이지 너비가 최소 너비보다 작은 경우
        else {
            // TOC 제거
            this.destroyToc();
        }
    }

    // TOC 컨테이너를 생성하여 HTML에 삽입하는 함수
    createTocContainer() {
        // TOC를 삽입할 위치(.inner 클래스를 가진 요소)를 찾음
        const contentInner = document.querySelector('#content .inner');

        // 삽입 위치를 찾지 못한 경우
        if (!contentInner) {
            // console.error('TOC를 삽입할 위치를 찾을 수 없습니다: #content .inner');
            return false; // 실패 반환
        }

        // TOC 컨테이너 요소 생성 (aside 태그 사용)
        const tocContainer = document.createElement('aside');
        // 컨테이너 ID 설정
        tocContainer.id = this.tocContainerId;
        // 컨테이너를 .inner 요소에 추가
        contentInner.appendChild(tocContainer);
        return true; // 성공 반환
    }

    // TOC 컨테이너를 제거하는 함수
    destroyToc() {
        // TOC 컨테이너 요소를 찾음
        const tocContainer = document.getElementById(this.tocContainerId);
        // 컨테이너가 존재하면 제거
        if (tocContainer) {
            tocContainer.remove();
        }
    }

    // TOC를 생성하는 함수
    generateToc() {
        // TOC 컨테이너 요소와 글 본문 요소 가져오기
        const tocContainer = document.getElementById(this.tocContainerId);
        const articleView = document.getElementById(this.articleViewId);

        // 글 본문 요소를 찾지 못한 경우
        if (!articleView) {
            console.error('articleView 를 찾을 수 없습니다.');
            return false; // 실패 반환
        }

        // 글 본문에서 제목을 찾을 영역을 가져옴
        const headingsTarget = articleView.querySelector(`.${this.headingsTargetClass}`);

        // 제목 영역을 찾지 못한 경우
        if (!headingsTarget) {
            console.error(`articleView 안에 ${this.headingsTargetClass} 클래스를 가진 요소를 찾을 수 없습니다.`);
            return false; // 실패 반환
        }

        // 제목 영역에서 h2, h3, h4 태그를 모두 찾음
        let headings = headingsTarget.querySelectorAll('h2, h3, h4');

        // 제목이 하나도 없는 경우
        if (headings.length === 0) {
            console.warn('article-view안에 h2, h3, h4 태그가 없습니다.');
            return false; // 실패 반환
        }

        // 마지막 요소가 불필요하게 추가되는 경우 제거
        if (headings.length > 0) {
            headings = Array.from(headings).slice(0, headings.length - 1);
        }

        // TOC 목록을 담을 ul 요소 생성
        const tocList = document.createElement('ul');
        tocList.classList.add(this.tocListClass);

        // 제목 목록을 계층 구조로 변환
        const structuredHeadings = this.structureHeadings(headings);

        // 계층 구조를 기반으로 TOC 목록 생성
        this.generateTocList(structuredHeadings, tocList);

        // TOC 제목 요소 생성 (div 태그 사용)
        let tocTitle = document.createElement('div');
        tocTitle.className = this.sfHeadingTitleClass; // sf-heading-title 클래스 사용
        tocTitle.textContent = "목차"; // 기본 제목

        // 글 제목(h1)을 가져와 TOC 제목으로 사용
        const h1Elements = articleView.querySelectorAll('h1');

        // 글 제목이 있는 경우
        if (h1Elements.length > 0) {
            const firstH1 = h1Elements[0];
            tocTitle.textContent = firstH1.textContent; // 글 제목으로 변경
        }

        // TOC 본문 영역 생성
        const tocBody = document.createElement('div');
        tocBody.classList.add(this.tocBodyClass); // sf-toc-body 클래스 사용

        // 제목과 목록을 본문 영역에 추가
        tocBody.appendChild(tocTitle);
        tocBody.appendChild(tocList);

        // TOC 컨테이너에 본문 영역 추가
        if (tocContainer) {
            tocContainer.appendChild(tocBody);

            // 스크롤 이벤트 리스너 추가 (포커스 표시)
            this.attachScrollEventListener(tocContainer);
        }

        return true; // 성공 반환
    }

    // 스크롤 이벤트 리스너를 추가하는 함수 (포커스 표시)
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

    // 현재 보고 있는 제목을 찾아 TOC에 포커스하는 함수
    checkFocus(tocContainer) {
        // 필요한 요소 가져오기
        const articleView = document.getElementById(this.articleViewId);
        if (!articleView) return;

        const headingsTarget = articleView.querySelector(`.${this.headingsTargetClass}`);
        if (!headingsTarget) return;

        const headings = headingsTarget.querySelectorAll('h2, h3, h4');
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

    // TOC에서 특정 제목에 포커스하는 함수
    setTocFocus(tocContainer, closestHeading) {
        // 모든 TOC 항목에서 포커스 제거
        const tocItems = tocContainer.querySelectorAll('.' + this.tocItemClass);
        tocItems.forEach(item => {
            item.classList.remove(this.sfTocFocusClass); // 포커스 제거
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
                focusedItem.classList.add(this.sfTocFocusClass);

                // 부모 ul 요소들을 모두 펼치기
                let parent = focusedItem.parentNode;
                while (parent && parent.tagName === 'UL') {
                    const listItem = parent.parentNode;
                    if (listItem && listItem.classList.contains(this.tocItemClass)) {
                        const toggleButton = listItem.querySelector('.' + this.sfTocToggleClass); // 토글 버튼 클래스 사용
                        if (toggleButton) {
                            toggleButton.classList.remove(this.sfTocToggleCloseClass); // 닫힘 클래스 제거
                            toggleButton.classList.add(this.sfTocToggleOpenClass);  // 열림 클래스 추가
                        }
                        parent.style.display = 'block';
                    }
                    parent = listItem.parentNode;
                }
            }
        }
    }

    /**
     * 제목 목록을 계층 구조로 변환하는 함수
     * @param {NodeList} headings - h1, h2, h3 요소의 NodeList
     * @returns {Array} - 계층 구조로 변환된 headings 배열
     */
    structureHeadings = (headings) => {
        const structuredHeadings = []; // 계층 구조로 변환된 제목 목록
        let currentH2 = null; // 현재 H2 제목
        let currentH3 = null; // 현재 H3 제목
        let currentH4 = null; // 현재 H4 제목

        // 모든 제목을 순회하며 계층 구조 생성
        headings.forEach(heading => {
            // H2 제목인 경우
            if (heading.tagName === 'H2') {
                currentH2 = {
                    element: heading,
                    children: [] // 자식 제목을 담을 배열
                };
                structuredHeadings.push(currentH2); // 계층 구조에 추가
                currentH3 = null; // H3 제목 초기화
                currentH4 = null; // H4 제목 초기화
            }
            // H3 제목인 경우 (현재 H2 제목이 존재해야 함)
            else if (heading.tagName === 'H3' && currentH2) {
                currentH3 = {
                    element: heading,
                    children: [] // 자식 제목을 담을 배열
                };
                currentH2.children.push(currentH3); // 현재 H2 제목의 자식으로 추가
                currentH4 = null; // H4 제목 초기화
            }
            // H4 제목인 경우 (현재 H3 제목이 존재해야 함)
            else if (heading.tagName === 'H4' && currentH3) {
                currentH4 = {
                    element: heading,
                    children: [] // 자식 제목을 담을 배열
                };
                currentH3.children.push(currentH4); // 현재 H3 제목의 자식으로 추가
            }
        });

        return structuredHeadings; // 계층 구조 반환
    }

    /**
     * 계층 구조를 기반으로 TOC 목록을 생성하는 재귀 함수
     * @param {Array} structuredHeadings - 계층 구조로 변환된 headings 배열
     * @param {HTMLElement} parentElement - TOC 목록을 추가할 부모 요소
     * @param {string} parentIndex - 부모 요소의 data-sf-idx 값
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
            listItem.classList.add(this.tocItemClass); // 클래스 추가
            listItem.dataset.sfIdx = currentIndex; // data-sf-idx 속성 추가

            // data-sf-tocheading 속성 추가 (h2, h3, h4)
            listItem.dataset.sfTocheading = heading.element.tagName.toLowerCase();

            // title 속성 추가 (툴팁)
            listItem.title = heading.element.textContent;

            // 하위 목록이 있는 경우 토글 버튼 생성
            let toggleButton = null;
            if (heading.children.length > 0) {
                toggleButton = document.createElement(this.toggleButtonTag); // 토글 버튼 요소 생성, span or div
                toggleButton.classList.add(this.sfTocToggleClass); // 토글 클래스 사용
                toggleButton.classList.add(this.sfTocToggleCloseClass); // 닫힘 클래스 추가
                toggleButton.textContent = ' '; // 텍스트 내용 추가 (CSS로 아이콘 표시)
            }

            // heading 텍스트를 감싸는 요소 생성 (div 또는 button)
            const headingWrapper = document.createElement(this.headingWrapperTag);
            headingWrapper.className = this.sfHeadingWrapperClass;

            // 클릭 이벤트 리스너 추가
            headingWrapper.addEventListener('click', (event) => {
                this.manualFocus = true; // 수동 포커스 설정
                this.scrollToHeading(heading.element); // 해당 heading으로 스크롤
                this.setTocFocus(document.getElementById(this.tocContainerId), heading.element); // 클릭한 heading element 전달
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
                        if (toggleButton.classList.contains(this.sfTocToggleCloseClass)) {
                            toggleButton.classList.remove(this.sfTocToggleCloseClass);
                            toggleButton.classList.add(this.sfTocToggleOpenClass);
                        } else {
                            toggleButton.classList.remove(this.sfTocToggleOpenClass);
                            toggleButton.classList.add(this.sfTocToggleCloseClass);
                        }
                    }
                    event.stopPropagation(); // 상위로 이벤트 전파 중단
                });
            }

            parentElement.appendChild(listItem);

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
        const offset = this.focusOffset;
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
    new sfTistoryToc();
});

/*
 * sf-tistory-toc.js 사용 방법:
 *
 * 1. HTML 설정:
 *    - 글 본문 영역에 <div id="article-view"></div>를 추가합니다.
 *    - <div id="article-view"> 내부에 제목 (h2, h3, h4)을 감싸는 컨테이너 요소에 class="tt_article_useless_p_margin"을 추가합니다.
 *    - <body> 태그 내에 <span class="sf-toc-open"></span>을 추가합니다. 이 요소가 존재해야 TOC가 활성화됩니다.
 *    - TOC가 삽입될 위치에 <aside id="sf-tistory-toc"></aside>를 추가합니다. (필수 사항은 아니며, 스크립트가 자동으로 생성합니다.)
 *
 * 2. CSS 스타일:
 *    - sf-tistory-toc.css 파일을 HTML에 연결합니다.
 *
 * 3. JavaScript 파일 연결:
 *    - sf-tistory-toc.js 파일을 HTML에 연결합니다.
 *
 * 4. 사용자 정의 옵션 (선택 사항):
 *    - sf-tistory-toc.js 파일 내의 constructor에서 다음 변수들을 수정하여 TOC의 동작과 스타일을 사용자 정의할 수 있습니다.
 *      - this.tocContainerId: TOC 컨테이너의 HTML ID.
 *      - this.articleViewId: 글 본문 영역의 HTML ID.
 *      - this.headingsTargetClass: 제목을 검색할 상위 요소의 클래스.
 *      - this.headingSelector: 목차에 포함될 제목 태그 선택자 (h2, h3, h4).
 *      - this.sfTocOpenClass: TOC를 활성화하는 클래스 (해당 클래스가 있는 경우에만 TOC 생성).
 *      - this.sfTocFocusClass: 현재 보고 있는 제목에 포커스를 주기 위한 클래스.
 *      - this.focusOffset: 스크롤 시 제목 위치를 조정하기 위한 오프셋 (픽셀 단위).
 *      - this.minPageWidth: TOC가 활성화될 최소 페이지 너비 (픽셀 단위).
 *      - this.sfHeadingTitleClass: TOC 제목 (h1)을 감싸는 요소의 클래스.
 *      - this.sfTocToggleClass: 하위 목록 토글 버튼의 클래스.
 *      - this.headingWrapperTag: 제목 텍스트를 감싸는 HTML 태그 (기본값: 'div').
 *      - this.manualFocus: 수동 포커스 모드 활성화 여부 (클릭 시 스크롤 방지).
 *      - this.toggleButtonTag: 토글 버튼을 감싸는 HTML 태그 (기본값: 'span').
 *      - this.sfTocToggleCloseClass: 토글 버튼 닫힘 상태 클래스.
 *      - this.sfTocToggleOpenClass: 토글 버튼 열림 상태 클래스.
 *      - this.tocBodyClass: TOC 전체를 감싸는 요소의 클래스.
 */