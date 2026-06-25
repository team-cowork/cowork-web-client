#!/bin/sh
# nginx 컨테이너 시작 시 실행(/docker-entrypoint.d/*.sh 자동 호출).
# config.js.template 의 ${*_REMOTE_URL} 환경변수를 치환해 브라우저에 서빙할 config.js 를 생성한다.
set -e

envsubst '${CHAT_REMOTE_URL} ${ISSUE_REMOTE_URL} ${PROFILE_REMOTE_URL}' \
  < /etc/nginx/config.js.template \
  > /usr/share/nginx/html/config.js

echo "[40-config-js] generated /usr/share/nginx/html/config.js"
