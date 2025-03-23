// script.js 파일

/**
 * 드래그 앤 드롭 기능을 구현하는 스크립트
 */

// 드래그할 요소
const sfDraggable = document.getElementById('sf-draggable');
// 드롭 대상 요소
const sfDropTarget = document.getElementById('sf-drop-target');

// 드래그 시작 이벤트
sfDraggable.addEventListener('dragstart', sfHandleDragStart);

// 드롭 대상 관련 이벤트
sfDropTarget.addEventListener('dragover', sfHandleDragOver);
sfDropTarget.addEventListener('dragenter', sfHandleDragEnter);
sfDropTarget.addEventListener('dragleave', sfHandleDragLeave);
sfDropTarget.addEventListener('drop', sfHandleDrop);
sfDraggable.addEventListener('dragend', sfHandleDragEnd);


/**
 * 드래그 시작 시 호출되는 함수
 * @param {DragEvent} event - 드래그 이벤트 객체
 */
function sfHandleDragStart(event) {
    // 드래그할 때 전달할 데이터 설정
    event.dataTransfer.setData('text/plain', event.target.id);
    event.target.classList.add('sf-dragging'); // 드래그 중 스타일 변경
}

/**
 * 드래그 요소가 드롭 대상 위에 있을 때 호출되는 함수
 * @param {DragEvent} event - 드래그 이벤트 객체
 */
function sfHandleDragOver(event) {
    // 기본 동작 막기 (drop 이벤트 발생을 위해 필요)
    event.preventDefault();
}

/**
 * 드래그 요소가 드롭 대상에 진입했을 때 호출되는 함수
 * @param {DragEvent} event - 드래그 이벤트 객체
 */
function sfHandleDragEnter(event) {
    event.preventDefault();
    // 드롭 대상에 스타일 변경
    sfDropTarget.classList.add('sf-drag-over');
}

/**
 * 드래그 요소가 드롭 대상에서 벗어났을 때 호출되는 함수
 * @param {DragEvent} event - 드래그 이벤트 객체
 */
function sfHandleDragLeave(event) {
    // 드롭 대상 스타일 초기화
    sfDropTarget.classList.remove('sf-drag-over');
}

/**
 * 드롭 이벤트 발생 시 호출되는 함수
 * @param {DragEvent} event - 드래그 이벤트 객체
 */
function sfHandleDrop(event) {
    event.preventDefault();

    // 드래그한 요소의 ID 가져오기
    const id = event.dataTransfer.getData('text/plain');
    const sfDraggedElement = document.getElementById(id);

    // 드롭 대상에 요소 추가
    sfDropTarget.appendChild(sfDraggedElement);

    // 드롭 대상 스타일 초기화
    sfDropTarget.classList.remove('sf-drag-over');
}
/**
 * 드래그 종료 시 호출되는 함수
 * @param {DragEvent} event - 드래그 이벤트 객체
 */
function sfHandleDragEnd(event) {
    event.preventDefault();
    // 드래그 스타일 초기화
    event.target.classList.remove('sf-dragging');
}