export const responseMessageData = {
  // 업무 처리 성공
  OK: '요청이 정상적으로 처리되었습니다.',
  CREATED: '리소스가 정상적으로 생성되었습니다.',
  ACCEPTED: '요청이 정상적으로 접수되었습니다.',
  NO_CONTENT: '요청이 정상적으로 처리되었습니다.',

  // 업무 처리 결과 안내
  MOVED_PERMANENTLY: '요청한 리소스가 영구적으로 이동되었습니다.',
  FOUND: '요청한 리소스가 임시로 이동되었습니다.',
  NOT_MODIFIED: '리소스가 수정되지 않았습니다.',
  TEMPORARY_REDIRECT: '요청이 임시로 다른 위치로 전달됩니다.',
  PERMANENT_REDIRECT: '요청이 영구적으로 다른 위치로 전달됩니다.',

  // 업무 처리 실패: 요청, 권한, 상태, 입력
  BAD_REQUEST: '잘못된 요청입니다.',
  UNAUTHORIZED: '인증이 필요하거나 인증 정보가 올바르지 않습니다.',
  FORBIDDEN: '해당 요청을 수행할 권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  METHOD_NOT_ALLOWED: '허용되지 않은 요청 방식입니다.',
  NOT_ACCEPTABLE: '요청 조건에 맞는 응답을 제공할 수 없습니다.',
  CONFLICT: '요청이 현재 리소스 상태와 충돌합니다.',
  GONE: '요청한 리소스가 영구적으로 삭제되었습니다.',
  PRECONDITION_FAILED: '요청의 사전 조건을 충족하지 못했습니다.',
  PAYLOAD_TOO_LARGE: '요청 데이터의 크기가 너무 큽니다.',
  UNSUPPORTED_MEDIA_TYPE: '지원하지 않는 미디어 형식입니다.',
  UNPROCESSABLE_CONTENT: '요청 형식은 올바르지만 처리할 수 없습니다.',
  TOO_MANY_REQUESTS: '요청 횟수가 너무 많습니다.',

  // 업무 처리 실패: 시스템
  INTERNAL_SERVER_ERROR: '서버 내부 오류가 발생했습니다.',
  NOT_IMPLEMENTED: '아직 지원하지 않는 기능입니다.',
  BAD_GATEWAY: '게이트웨이 처리 중 오류가 발생했습니다.',
  SERVICE_UNAVAILABLE: '현재 서비스를 이용할 수 없습니다.',
  GATEWAY_TIMEOUT: '서버 응답 시간이 초과되었습니다.',
} as const;
