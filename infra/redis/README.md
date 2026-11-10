# Redis

## stickerheaven.docker.conf  

Es la configuración crítica para Docker . El archivo docker-compose.prod.yml lo monta dentro del contenedor Nginx. Si lo borras, el contenedor de producción no arrancará o no sabrá cómo redirigir el tráfico a la web y a la API.

## snippets/ 

Esta carpeta contiene configuraciones compartidas (como seguridad SSL y cabeceras de proxy). Los archivos .conf principales los "llaman" usando include . Si borras esta carpeta, Nginx dará un error de "archivo no encontrado" al intentar cargar la configuración.

## stickerheaven.conf 

Es la variante para instalaciones "Bare Metal" (instalar Nginx directamente en Windows/Linux sin Docker). Aunque no se usa en el flujo de Docker, es el archivo de referencia para despliegues tradicionales.

## conf.d/ 

Es el directorio estándar donde Nginx busca las configuraciones de los sitios (vhosts). Si se borra, Nginx no encontrará las configuraciones necesarias para servir contenido.
