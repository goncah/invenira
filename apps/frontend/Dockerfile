FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY /nginx/nginx.conf /etc/nginx/conf.d
COPY /dist/apps/frontend /usr/share/nginx/html
