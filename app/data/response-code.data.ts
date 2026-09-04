export const responseCodeData = {
  // 업무 처리 성공
  OK: 'OK', // 요청 처리 성공
  CREATED: 'CREATED', // 리소스 생성 성공
  ACCEPTED: 'ACCEPTED', // 처리 접수 성공
  NO_CONTENT: 'NO_CONTENT', // 본문 없는 처리 성공

  // 업무 처리 결과 안내
  MOVED_PERMANENTLY: 'MOVED_PERMANENTLY', // 영구 이동 처리
  FOUND: 'FOUND', // 임시 이동 처리
  NOT_MODIFIED: 'NOT_MODIFIED', // 변경 없음
  TEMPORARY_REDIRECT: 'TEMPORARY_REDIRECT', // 임시 전달 처리
  PERMANENT_REDIRECT: 'PERMANENT_REDIRECT', // 영구 전달 처리

  // 업무 처리 실패: 요청, 권한, 상태, 입력
  BAD_REQUEST: 'BAD_REQUEST', // 요청 값 오류
  UNAUTHORIZED: 'UNAUTHORIZED', // 인증 정보 오류
  FORBIDDEN: 'FORBIDDEN', // 권한 부족
  NOT_FOUND: 'NOT_FOUND', // 대상 없음
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED', // 허용되지 않은 처리 방식
  NOT_ACCEPTABLE: 'NOT_ACCEPTABLE', // 요청 조건 불충족
  CONFLICT: 'CONFLICT', // 현재 상태 충돌
  GONE: 'GONE', // 영구 삭제된 대상
  PRECONDITION_FAILED: 'PRECONDITION_FAILED', // 사전 조건 불충족
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE', // 입력 데이터 크기 초과
  UNSUPPORTED_MEDIA_TYPE: 'UNSUPPORTED_MEDIA_TYPE', // 지원하지 않는 입력 형식
  UNPROCESSABLE_CONTENT: 'UNPROCESSABLE_CONTENT', // 처리할 수 없는 입력값
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS', // 요청 횟수 제한 초과

  // 업무 처리 실패: 시스템
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR', // 내부 처리 오류
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED', // 지원하지 않는 기능
  BAD_GATEWAY: 'BAD_GATEWAY', // 연동 처리 오류
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE', // 서비스 이용 불가
  GATEWAY_TIMEOUT: 'GATEWAY_TIMEOUT', // 처리 시간 초과
} as const;
