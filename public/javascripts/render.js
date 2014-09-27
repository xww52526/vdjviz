var items = [];
var histogramData = [];

function del(urlToDelete) {
    $.ajax({
        url : urlToDelete,
        type : 'DELETE',
        success : function ( results ) {
            //refresh the page
            location.reload ( ) ;
        }
    });
}

function getHistogramData(url) {
    $.getJSON(url, function(data){
        $.each(data, function(key, value){
            var item = {"xCoordinate" : value.xCoordinate ,"yCoordinate" : value.yCoordinate,
                        "clonotype" : value.clonotype, "clonotypeName": value.clonotypeName};
            histogramData.push(item);
        });
    renderHistogram();
    });
}

//TODO
function getJson(url) {
    $.getJSON(url, function(data){

        $.each(data, function(key, value){
            var item = [value.vSegment, value.jSegment, value.relationNum ];
            items.push(item);

        });
    renderTable();
    });
}



function renderHistogram() {
    var width = 1000,
        barHeight = 20,
        maxHeight = 0;

    var colors = d3.scale.category20().range();

    var spectratype = [];
    var clonotypes = [];
    var barsHeight = [];

    $.each(histogramData, function(index, value) {
        if (value.clonotype && value.yCoordinate > maxHeight) {
            maxHeight = value.yCoordinate * 1500 + 500;
        }
        if (!value.clonotype) {
            spectratype.push(value);
            barsHeight.push({x : value.xCoordinate, h : value.yCoordinate});
        } else {
            clonotypes.push(value);
        }
    });

    var svg = d3.select("vis-body")
        .append("svg")
        .attr("class", "chart");

    var chart = d3.select("svg")
        .attr("width", width)
        .attr("height", maxHeight);

    var bar = chart.selectAll("g")
        .data(spectratype)
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(" + d.xCoordinate * 10 + "," + (maxHeight - d.yCoordinate * 1500)  +")"; });

    bar.append("rect")
        .attr("height", function(d) {return d.yCoordinate * 1500;})
        .attr("width", barHeight - 1)
        .style("fill", "#DCDCDC");

    bar.append("text")
        .attr("type", "spectratype");

    var tip = chart.selectAll("tip")
        .data(clonotypes)
        .enter().append("g")
        .attr("transform", "translate(10, 10)")
        .attr("class", "tip")
        .attr("id", function(d, i) {return i;})
        .append("rect")
        .attr("height", 100)
        .attr("width", 400)
        .style("fill", function(d, i) {
            return colors[i];
        })
        .style("opacity", "0.3")
        .style("visibility", "hidden")


    var clonotypeBar = chart.selectAll("div")
        .data(clonotypes)
        .enter().append("g")
        .attr("class", "clonotype")
        .on("mouseover", function(d,i) {
            $("#" + i).find("rect").css("visibility", "visible");

        })
        .on("mouseout", function(d,i) {
            $("#" + i).find("rect").css("visibility", "hidden");

        })
        .attr("id", function(d, i) {
            return i;
        })
        .style("cursor", "pointer")
        .attr("transform", function(d, i) {
            var bar = findBarHeight(d.xCoordinate);
            bar.h += d.yCoordinate;
            return "translate(" + d.xCoordinate * 10 + "," + (maxHeight - bar.h * 1500)  +")";
        });


    clonotypeBar.append("rect")
        .attr("height", function(d) {return d.yCoordinate * 1500;})
        .attr("width", barHeight - 1)
        .style("fill", function(d, i) { return colors[i] })


    function findBarHeight(x) {
        for (var i = 0; i < barsHeight.length; i++) {
            if (barsHeight[i].x == x) {
                return barsHeight[i];
            }
        }
        return null;
    }
}


function renderTable() {
    var width = 1200, height = 800, margin = {b: 0, t: 40, l: 170, r: 50};

    var svg = d3.select("vis-body")
        .append("svg").attr('width', width).attr('height', (height + margin.b + margin.t))
        .append("g").attr("transform", "translate(" + margin.l + "," + margin.t + ")");

    var data = [
        {data: bP.partData(items, 2), id: 'Table', header: ["V", "J", "Table"]}
    ];

    bP.draw(data, svg);
}

!function(){
    var bP={};
    var b=30, bb=800, height=700, buffMargin=5, minHeight=5;
    var c1=[-180, 30], c2=[-50, 140], c3=[0, 200]; //Column positions of labels.
    var colors = d3.scale.category20().range();

    bP.partData = function(data,p){
        var sData={};

        sData.keys=[
            d3.set(data.map(function(d){ return d[0];})).values().sort(function(a,b){ return ( a<b? -1 : a>b ? 1 : 0);}),
            d3.set(data.map(function(d){ return d[1];})).values().sort(function(a,b){ return ( a<b? -1 : a>b ? 1 : 0);})
        ];

        sData.data = [	sData.keys[0].map( function(d){ return sData.keys[1].map( function(v){ return 0; }); }),
            sData.keys[1].map( function(d){ return sData.keys[0].map( function(v){ return 0; }); })
        ];

        data.forEach(function(d){
            sData.data[0][sData.keys[0].indexOf(d[0])][sData.keys[1].indexOf(d[1])]=d[p];
            sData.data[1][sData.keys[1].indexOf(d[1])][sData.keys[0].indexOf(d[0])]=d[p];
        });

        return sData;
    }

    function visualize(data){
        var vis ={};
        function calculatePosition(a, s, e, b, m){
            var total=d3.sum(a);
            var sum=0, neededHeight=0, leftoverHeight= e-s-2*b*a.length;
            var ret =[];

            a.forEach(
                function(d){
                    var v={};
                    v.percent = (total == 0 ? 0 : d/total);
                    v.value=d;
                    v.height=Math.max(v.percent*(e-s-2*b*a.length), m);
                    (v.height==m ? leftoverHeight-=m : neededHeight+=v.height );
                    ret.push(v);
                }
            );

            var scaleFact=leftoverHeight/Math.max(neededHeight,1), sum=0;

            ret.forEach(
                function(d){
                    d.percent = scaleFact*d.percent;
                    d.height=(d.height==m? m : d.height*scaleFact);
                    d.middle=sum+b+d.height/2;
                    d.y=s + d.middle - d.percent*(e-s-2*b*a.length)/2;
                    d.h= d.percent*(e-s-2*b*a.length);
                    d.percent = (total == 0 ? 0 : d.value/total);
                    sum+=2*b+d.height;
                }
            );
            return ret;
        }

        vis.mainBars = [
            calculatePosition( data.data[0].map(function(d){ return d3.sum(d);}), 0, height, buffMargin, minHeight),
            calculatePosition( data.data[1].map(function(d){ return d3.sum(d);}), 0, height, buffMargin, minHeight)
        ];

        vis.subBars = [[],[]];
        vis.mainBars.forEach(function(pos,p){
            pos.forEach(function(bar, i){
                calculatePosition(data.data[p][i], bar.y, bar.y+bar.h, 0, 0).forEach(function(sBar,j){
                    sBar.key1=(p==0 ? i : j);
                    sBar.key2=(p==0 ? j : i);
                    vis.subBars[p].push(sBar);
                });
            });
        });
        vis.subBars.forEach(function(sBar){
            sBar.sort(function(a,b){
                return (a.key1 < b.key1 ? -1 : a.key1 > b.key1 ?
                    1 : a.key2 < b.key2 ? -1 : a.key2 > b.key2 ? 1: 0 )});
        });

        vis.edges = vis.subBars[0].map(function(p,i){
            return {
                key1: p.key1,
                key2: p.key2,
                y1:p.y,
                y2:vis.subBars[1][i].y,
                h1:p.h,
                h2:vis.subBars[1][i].h
            };
        });
        vis.keys=data.keys;
        return vis;
    }

    function arcTween(a) {
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
            return edgePolygon(i(t));
        };
    }

    function drawPart(data, id, p){
        d3.select("#"+id).append("g").attr("class","part"+p)
            .attr("transform","translate("+( p*(bb+b))+",0)");
        d3.select("#"+id).select(".part"+p).append("g").attr("class","subbars");
        d3.select("#"+id).select(".part"+p).append("g").attr("class","mainbars");

        var mainbar = d3.select("#"+id).select(".part"+p).select(".mainbars")
            .selectAll(".mainbar").data(data.mainBars[p])
            .enter().append("g").attr("class","mainbar");

        mainbar.append("rect").attr("class","mainrect")
            .attr("x", 0).attr("y",function(d){ return d.middle-d.height/2; })
            .attr("width",b).attr("height",function(d){ return d.height; })
            .style("shape-rendering","auto")
            .style("fill-opacity",0).style("stroke-width","0.5")
            .style("stroke","black").style("stroke-opacity",0);

        mainbar.append("text").attr("class","barlabel")
            .attr("x", c1[p]).attr("y",function(d){ return d.middle+5;})
            .text(function(d,i){ return data.keys[p][i];})
            .attr("text-anchor","start" );

        mainbar.append("text").attr("class","barvalue")
            .attr("x", c2[p]).attr("y",function(d){ return d.middle+5;})
            .text(function(d,i){ return d.value ;})
            .attr("text-anchor","end");

        mainbar.append("text").attr("class","barpercent")
            .attr("x", c3[p]).attr("y",function(d){ return d.middle+5;})
            .text(function(d,i){ return "( "+Math.round(100*d.percent)+"%)" ;})
            .attr("text-anchor","end").style("fill","grey");

        d3.select("#"+id).select(".part"+p).select(".subbars")
            .selectAll(".subbar").data(data.subBars[p]).enter()
            .append("rect").attr("class","subbar")
            .attr("x", 0).attr("y",function(d){ return d.y})
            .attr("width",b).attr("height",function(d){ return d.h})
            .style("fill",function(d){ return colors[d.key1];});
    }

    function drawEdges(data, id){
        d3.select("#"+id).append("g").attr("class","edges").attr("transform","translate("+ b+",0)");

        d3.select("#"+id).select(".edges").selectAll(".edge")
            .data(data.edges).enter().append("polygon").attr("class","edge")
            .attr("points", edgePolygon).style("fill",function(d){ return colors[d.key1];})
            .style("opacity",0.5).each(function(d) { this._current = d; });
    }

    function drawHeader(header, id){
        d3.select("#"+id).append("g").attr("class","header").append("text").text(header[2])
            .style("font-size","20").attr("x",108).attr("y",-20).style("text-anchor","middle")
            .style("font-weight","bold");

        [0,1].forEach(function(d){
            var h = d3.select("#"+id).select(".part"+d).append("g").attr("class","header");

            h.append("text").text(header[d]).attr("x", (c1[d]-5))
                .attr("y", -5).style("fill","grey");

            h.append("text").text("Count").attr("x", (c2[d]-10))
                .attr("y", -5).style("fill","grey");

            h.append("line").attr("x1",c1[d]-10).attr("y1", -2)
                .attr("x2",c3[d]+10).attr("y2", -2).style("stroke","black")
                .style("stroke-width","1").style("shape-rendering","crispEdges");
        });
    }

    function edgePolygon(d){
        return [0, d.y1, bb, d.y2, bb, d.y2+d.h2, 0, d.y1+d.h1].join(" ");
    }

    function transitionPart(data, id, p){
        var mainbar = d3.select("#"+id).select(".part"+p).select(".mainbars")
            .selectAll(".mainbar").data(data.mainBars[p]);

        mainbar.select(".mainrect").transition().duration(500)
            .attr("y",function(d){ return d.middle-d.height/2;})
            .attr("height",function(d){ return d.height;});

        mainbar.select(".barlabel").transition().duration(500)
            .attr("y",function(d){ return d.middle+5;});

        mainbar.select(".barvalue").transition().duration(500)
            .attr("y",function(d){ return d.middle+5;}).text(function(d,i){ return d.value ;});

        mainbar.select(".barpercent").transition().duration(500)
            .attr("y",function(d){ return d.middle+5;})
            .text(function(d,i){ return "( "+Math.round(100*d.percent)+"%)" ;});

        d3.select("#"+id).select(".part"+p).select(".subbars")
            .selectAll(".subbar").data(data.subBars[p])
            .transition().duration(500)
            .attr("y",function(d){ return d.y}).attr("height",function(d){ return d.h});
    }

    function transitionEdges(data, id){
        d3.select("#"+id).append("g").attr("class","edges")
            .attr("transform","translate("+ b+",0)");

        d3.select("#"+id).select(".edges").selectAll(".edge").data(data.edges)
            .transition().duration(500)
            .attrTween("points", arcTween)
            .style("opacity",function(d){ return (d.h1 ==0 || d.h2 == 0 ? 0 : 0.5);});
    }

    function transition(data, id){
        transitionPart(data, id, 0);
        transitionPart(data, id, 1);
        transitionEdges(data, id);
    }

    bP.draw = function(data, svg){
        data.forEach(function(biP,s){
            svg.append("g")
                .attr("id", biP.id)
                .attr("transform","translate("+ (550*s)+",0)");

            var visData = visualize(biP.data);
            drawPart(visData, biP.id, 0);
            drawPart(visData, biP.id, 1);
            drawEdges(visData, biP.id);
            drawHeader(biP.header, biP.id);

            [0,1].forEach(function(p){
                d3.select("#"+biP.id)
                    .select(".part"+p)
                    .select(".mainbars")
                    .selectAll(".mainbar")
                    .on("mouseover",function(d, i){ return bP.selectSegment(data, p, i); })
                    .on("mouseout",function(d, i){ return bP.deSelectSegment(data, p, i); });
            });
        });
    }

    bP.selectSegment = function(data, m, s){
        data.forEach(function(k){
            var newdata =  {keys:[], data:[]};

            newdata.keys = k.data.keys.map( function(d){ return d;});

            newdata.data[m] = k.data.data[m].map( function(d){ return d;});

            newdata.data[1-m] = k.data.data[1-m]
                .map( function(v){ return v.map(function(d, i){ return (s==i ? d : 0);}); });

            transition(visualize(newdata), k.id);

            var selectedBar = d3.select("#"+k.id).select(".part"+m).select(".mainbars")
                .selectAll(".mainbar").filter(function(d,i){ return (i==s);});

            selectedBar.select(".mainrect").style("stroke-opacity",1);
            selectedBar.select(".barlabel").style('font-weight','bold');
            selectedBar.select(".barvalue").style('font-weight','bold');
            selectedBar.select(".barpercent").style('font-weight','bold');
        });
    }

    bP.deSelectSegment = function(data, m, s){
        data.forEach(function(k){
            transition(visualize(k.data), k.id);

            var selectedBar = d3.select("#"+k.id).select(".part"+m).select(".mainbars")
                .selectAll(".mainbar").filter(function(d,i){ return (i==s);});

            selectedBar.select(".mainrect").style("stroke-opacity",0);
            selectedBar.select(".barlabel").style('font-weight','normal');
            selectedBar.select(".barvalue").style('font-weight','normal');
            selectedBar.select(".barpercent").style('font-weight','normal');
        });
    }
    this.bP = bP;
}();