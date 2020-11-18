FROM r-base:latest
MAINTAINER Raziel Carvajal-Gomez <raziel.carvajal-gomez@uclouvain.be>

WORKDIR /usr/app

RUN apt-get update -y && apt-get install -y curl

COPY r-plotter-pkgs.R ./
RUN R CMD BATCH r-plotter-pkgs.R

COPY plot.R ./
COPY plot.sh ./

CMD ./plot.sh
