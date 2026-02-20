FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy project files
COPY . /usr/share/nginx/html

# Create nginx config that uses Railway PORT
RUN echo 'server { \
    listen ${PORT}; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { try_files $uri $uri/ /index.html; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["sh", "-c", "nginx -g 'daemon off;'"]