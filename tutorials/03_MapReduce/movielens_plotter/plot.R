library(ggplot2)
library(rjson)

result_set <- fromJSON(
  paste(
    readLines("result_set.json"),
    collapse=""
  )
)
test <- lapply(result_set$rows, function(i){
  c(i$key, i$value)
})

asM <- do.call("rbind", test)

asDf <- data.frame(
  category=asM[,1],
  count=as.numeric(asM[,2]),
  stringsAsFactors=F
)
p <- ggplot(asDf)

p<- p + geom_col(aes(x=category, y=count, fill=category)) +
  theme(axis.title.x=element_blank(), axis.text.x=element_blank(), axis.ticks.x=element_blank()) +
  labs(y="Number of Movies", title="Total movies for each category")

pdf("histogram.pdf")
print(p)
