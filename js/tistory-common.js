/* 노드 삭제 id 및 클래스이름을 찾아서 노드 삭제 */
class sfdelete {
    constructor(selectors) {
        this.selectors = selectors;
    }

    removeNodes() {
        this.selectors.forEach(selector => {
            // 선택자에 해당하는 모든 요소를 찾습니다.
            const elements = document.querySelectorAll(`.${selector}`);

            // 각 요소를 순회하며 삭제합니다.
            elements.forEach(element => {
                element.remove();
            });
        });
    }
}

// 티스토리 하단 컨테이너 삭제 페이지 로드완료후 실행 
document.addEventListener("DOMContentLoaded", () => {
    // 노드 삭제 
    // id="story-contents-box-root-container" 모바일에서 강제로 보여짐 스토리 노드 
    const deleter = new sfdelete(["story-contents-box-root-container",
        "b", "c", "d", "e", "f"]);
    deleter.removeNodes();
});