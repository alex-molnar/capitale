FROM nginx:1.29.8

RUN rm -f /usr/share/nginx/html/index.html

COPY index.html /usr/share/nginx/html
COPY src /usr/share/nginx/html/src
COPY style /usr/share/nginx/html/style
COPY assets /usr/share/nginx/html/assets