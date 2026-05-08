FROM nginx:1.29.8

ARG FLAVOUR

RUN rm -f /usr/share/nginx/html/index.html

RUN mkdir -p /usr/share/nginx/html/src

COPY index.html /usr/share/nginx/html
COPY src/format.js /usr/share/nginx/html/src/format.js
COPY src/mathHelpers.js /usr/share/nginx/html/src/mathHelpers.js
COPY src/$FLAVOUR.js /usr/share/nginx/html/src/index.js
COPY src/$FLAVOUR-data.js /usr/share/nginx/html/src/data.js
COPY style /usr/share/nginx/html/style
COPY assets /usr/share/nginx/html/assets