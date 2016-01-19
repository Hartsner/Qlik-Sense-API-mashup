var config = {
    host: window.location.hostname,
    prefix: "/",
    port: window.location.port,
    isSecure: window.location.protocol === "https:"
};
require.config( {
    baseUrl: ( config.isSecure ? "https://" : "http://" ) + config.host + (config.port ? ":" + config.port: "") + config.prefix + "resources"
} );


require( ["js/qlik"], function ( qlik ) {
    qlik.setOnError( function ( error ) {
        alert( error.message );
    } );

    //callbacks -- inserted here --
    //open apps -- inserted here --    
    var app = qlik.openApp('Sales Discovery.qvf', config);

    //CreateList starts

    //Saving selected item text
    //var itemValue;


    var stateqFieldDefs = "state_abbr";
    app.createList({
        //defining the field i want to connect to
        "qDef" : {
            //specify the field
            'qFieldDefs' : [stateqFieldDefs]
        },
        'qInitialDataFetch' : [{
            qTop : 0,
            qLeft : 0,
            qHeight : 54, //rows
            qWidth : 1
        }]
    }, function (reply){

        //empty out the Dic you've created to hold the list
        $("#flS").empty();

        //Get Object
        var qObject = reply.qListObject;
        $.each(qObject.qDataPages[0].qMatrix, function(){
            //get the current item
            var getqText = [];
            var item = this[0];
            getqText.push(this[0].qText);
            var selT = "";
            //Check to see if it's selected, if, so, set the list item to bold
            if (item.qState == "S"){
                selT = " class=\"active\"";
            }
            $("#flS").append("<li" + selT + ">" + item.qText + "</li>");
        });
        //add the ability for the item to be clicked and selected in Qlik
        $("#flS li").click(function() {
            app.field(stateqFieldDefs).toggleSelect($(this).text(), true);
        });
        var numItems = $('#flS .active').length;
        if (numItems > 0){
            $('#s').empty().append(numItems + " of 54 states" + " <span class='caret'><span>"); 
        }
        else{
            $('#s').empty().append("All States" + " <span class='caret'><span>"); 
        }
    });
    //Saving selected item text
    var itemValue;
    var ChangeqFieldDefs = "Month";
    app.createList({
        //defining the field i want to connect to
        "qDef" : {
            //specify the field
            'qFieldDefs' : [ChangeqFieldDefs]
        },
        'qInitialDataFetch' : [{
            qTop : 0,
            qLeft : 0,
            qHeight : 12, //rows
            qWidth : 1
        }]
    }, function (reply){
        //console.log("reply Month: ", reply)
        //app.destroySessionObject(reply.qInfo.qId);
        //app.clearAll();
        //reply holding all the information

        //empty out the Dic you've created to hold the list
        $("#flM").empty();

        //Get Object
        var qObject = reply.qListObject;
        $.each(qObject.qDataPages[0].qMatrix, function(){
            //get the current item
            var getqText = [];
            var item = this[0];
            getqText.push(this[0].qText);
            var selT = "";
            //Check to see if it's selected, if, so, set the list item to bold
            if (item.qState == "S"){
                selT = " class=\"active\"";
            }
            $("#flM").append("<li" + selT + ">" + item.qText + "</li>");
        });
        //add the ability for the item to be clicked and selected in Qlik
        $("#flM li").click(function() {
            app.field(ChangeqFieldDefs).toggleSelect($(this).text(), true);
        });
        var numItems = $('#flM .active').length;
        if (numItems > 0){
            $('#m').empty().append(numItems + " of 12 months" + " <span class='caret'><span>"); 
        }
        else{
            $('#m').empty().append("All Months" + " <span class='caret'><span>"); 
        }
    });


    //--------------------------------countryField Starts

    //Saving selected item text
    var countryValue;
    var CountryFieldDefs = "Region Name";
    app.createList({
        //defining the field i want to connect to
        "qDef" : {
            //specify the field

            'qFieldDefs' : [CountryFieldDefs]
        },
        'qInitialDataFetch' : [{
            qTop : 0,
            qLeft : 0,
            qHeight : 6, //rows
            qWidth : 1
        }]
    }, function (reply){
        //console.log("reply country: ", reply)
        $("#flR").empty();
        //Get Object
        //var qObject = reply.qListObject;
        $.each(reply.qListObject.qDataPages[0].qMatrix, function(){
            //get the current item
            var country = [];
            var item = this[0];
            //console.log(item);
            country.push(this[0].qText);
            var selT = "";
            //Check to see if it's selected, if, so, set the list item to bold
            if (item.qState == "S"){
                selT = " class=\"active2\"";
            }
            //append the item to the list
            $("#flR").append("<li" + selT + ">" + item.qText + "</li>");

        });
        //add the ability for the item to be clicked and selected in Qlik
        $("#flR li").click(function() {
            app.field(CountryFieldDefs).toggleSelect($(this).text(), true);
        });
        var numItems = $('#flR .active2').length;
        if (numItems > 0){
            $('#c').empty().append(numItems + " of 6 Regions" + " <span class='caret'><span>"); 
        }
        else{
            $('#c').empty().append("All Regions" + " <span class='caret'><span>"); 
        }
    });

    //--------------------------------countryField ends

    //creating a hyperCube with BarChart -----------------------------------------
    app.createCube({
        qDimensions: [{
            qDef: {
                qFieldDefs: ["Region Name"]
            }
        }],
        qMeasures: [{
            qDef: {
                qDef: "Sum([YTD Sales Amount])",
                qlabel: "Sales"
            }
        }],
        qInitialDataFetch: [{
            qHeight: 6,
            qWidth: 2
        }]

    }, function(reply){
        //console.log("2", reply);
        var fieldArray = [];
        var defArray = [];

        $.each(reply.qHyperCube.qDataPages[0].qMatrix, function(index, value) {
            var num = this[1].qText;
            num.substring(1);
            num = num.replace(/,/g, '.');
            num = num.substring(1);
            num = parseFloat(num);
            if (!this[0].qIsEmpty){
                var n = [];
                n.push(this[1].qText, num);
                fieldArray.push(n);
                defArray.push(this[0].qText);
            }

        });

        //console.log(fieldArray);
        //Start d3 chart
        //create the pie chart
        $(function () {



            $('#bcYTD').highcharts({
                colors: ["#6C7A89"],
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Sum YTD sales'
                },
                xAxis: {
                    categories: defArray
                },
                yAxis: {
                    title: {
                        text: "Sales"
                    }
                },
                legend: {
                    enabled: false
                },
                credits: {
                    enabled: false  
                },
                plotOptions: {
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            format: '${point.y:.1f}M'
                        },
                        point: {
                            events: {
                                click: function (e) {
                                    var dim1 = this.category;
                                    var arr= [];
                                    arr.push(dim1);
                                    //e.stopPropagation();
                                    //                                    app.field("Region Name").toggleSelect(arr.valueOf, true);

                                    //app.field("Region Name").selectValues(arr, true, true);
                                    app.field("Region Name").selectValues(arr,false, true);
                                }
                            }
                        },

                        column: {
                            states: {
                                hover: {
                                    color: '#DADFE1'                                                           
                                }
                            }
                        }
                    }
                },

                tooltip: {
                    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                    pointFormat: '<span style="color:{point.color}"><b>{point.name}<br/>'
                },

                series: [{
                    name: "Sales",
                    colorByPoint: true,
                    data: fieldArray, color: "#DADFE1",
                }]


            });
        });

    });
    //end hyperCube BarChart ---------------------------------------------------



    //creating a hyperCube with BarChart whit lines -----------------------------------------
    app.createCube({
        qDimensions: [{
            qDef: {
                qFieldDefs: ["Region Name"]
            }
        }],
        qMeasures: [{
            qDef: {
                qDef: "Sum([YTD Sales Amount])",
                qlabel: "Sales",
            }

        },
                    {
                        qDef: {
                            qDef: "Sum ([YTD Budget Amount])",
                            qlabel: "Sales Goal",
                        }  
                    }
                   ],
        qInitialDataFetch: [{
            qHeight: 6,
            qWidth: 3
        }]
    }, function(reply){
        var fieldArray = [];
        var defArray = [];
        var budget = [];
        var sales = (reply.qHyperCube.qGrandTotalRow[0].qText);
        $("#total").text(sales);
        $.each(reply.qHyperCube.qDataPages[0].qMatrix, function(index, value) {

            var num = this[1].qText;
            num.substring(1);
            num = num.replace(/,/g, '.');
            num = num.substring(1);
            num = parseFloat(num);
            if (!this[0].qIsEmpty){
                var n = [];
                n.push(this[1].qText, num);
                fieldArray.push(n);
                defArray.push(this[0].qText);
            }

            var bud = this[2].qText;
            bud.substring(1);
            bud = bud.replace(/,/g, '.');
            bud = bud.substring(1);
            bud = parseFloat(bud);
            if (!this[0].qIsEmpty){
                var n = [];
                n.push(this[2].qText, bud);
                budget.push(n);
            }


            //            if (!this[0].qIsEmpty){
            //                avg.push(this[1].qNum);
            //                avg2.push(this[0].qText);
            //            }
            //console.log(defArray);

            //create the pie chart
        });
        //console.log("b ",fieldArray);
        //Start d3 chart
        //create the pie chart
        $(function () {
            $('#bcBudget').highcharts({
                chart: {
                    zoomType: 'xy'
//                    backgroundColor: '#F8F8F8'
                },
                title: {
                    text: 'Sales and Budget'
                },
                subtitle: {
                    text: ''
                },
                xAxis: [{
                    categories: defArray,
                    crosshair: true
                }],
                yAxis: [{ // Primary yAxis
                    title: {
                        text: 'Sales Budget',
                        style: {
                            color: '#494949'
                        }
                    },
                    labels: {
                        format: '${value} M',
                        style: {
                            color: '#494949'
                        }
                    }
                }, { // Secondary yAxis
                    title: {
                        text: '',
                        style: {
                            color: '#494949'
                        }
                    },
                    labels: {
                        format: '${value} M',
                        style: {
                            color: '#494949'
                        }
                    },
                    opposite: true
                }],
                tooltip: {
                    shared: true
                },
                credits: {
                    enabled: false  
                },
                legend: {
                    layout: 'vertical',
                    align: 'left',
                    x: 120,
                    verticalAlign: 'top',
                    y: 100,
                    floating: true,
                    backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
                },
                series: [{
                    name: 'Sales',
                    type: 'column',
                    //                    yAxis: 1,
                    data: fieldArray, color: "#6C7A89",
                    tooltip: {
                        valueSuffix: ' K'
                    },point: {
                        events: {
                            click: function () {
                                var dim1 = this.category;
                                var arr= [];
                                arr.push(dim1);
                                app.field("Region Name").selectValues(arr, false, true);
                            }
                        }
                    }

                }, {
                    name: 'Budget',
                    type: 'spline',
                    data: budget, color: "#51A388",
                    tooltip: {
                        valueSuffix: ' K'
                    },point: {
                        events: {
                            click: function () {
                                var dim1 = this.category;
                                var arr= [];
                                arr.push(dim1);
                                app.field("Region Name").selectValues(arr, false, true);
                            }
                        }
                    },
                    column: {
                        states: {
                            hover: {
                                color: '#DADFE1'                                                           
                            }
                        }
                    }                    
                }]
            });
        });
        // app.destroySessionObject(reply.qInfo.qId);
    });
    //end hyperCube BarChart ---------------------------------------------------

    //creating a hyperCube with BarChart -----------------------------------------
    app.createCube({
        qDimensions: [{
            qDef: {
                qFieldDefs: ["Region Name"]
            }
        }],
        qMeasures: [{
            qDef: {
                qDef: "Avg([List Price])",
                qlabel: "Avg List Price"
            }
        }],
        qInitialDataFetch: [{
            qHeight: 6,
            qWidth: 2
        }]

    }, function(reply){

        //console.log("2--------------------------", reply);
        var fieldArray = [];
        var defArray = [];
        $.each(reply.qHyperCube.qDataPages[0].qMatrix, function(index, value) {

            //So it will display the right amount e.g $18.2M and not 1823124.09
            var num = this[1].qText;
            num.substring(1);
            num = num.replace(/,/g, '.');
            num = num.substring(1);
            num = parseFloat(num);
            if (!this[0].qIsEmpty){
                var n = [];
                n.push(this[1].qText, num);
                fieldArray.push(n);
                defArray.push(this[0].qText);
            }

            //create the pie chart
        });


        //Start d3 chart
        //create the pie chart
        $(function () {

            $('#bcList').highcharts({
                colors: ["#6C7A89"],
                chart: {
                    type: 'bar'
                },
                title: {
                    text: 'Avg List Price'
                },
                xAxis: {
                    categories: defArray
                },
                yAxis: {
                    title: {
                        text: "List Price"
                    }

                },
                legend: {
                    enabled: false
                },
                credits: {
                    enabled: false  
                },
                plotOptions: {
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            format: '${point.y:.1f}M'
                        },
                        point: {
                            events: {
                                click: function () {
                                    var dim1 = this.category;
                                    var arr= [];
                                    arr.push(dim1);
                                    app.field("Region Name").selectValues(arr, false, true);
                                }
                            }
                        },
                        column: {
                            states: {
                                hover: {
                                    color: '#DADFE1'                                                           
                                }
                            }
                        }

                    }
                },

                tooltip: {
                    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                    pointFormat: '<span style="color:{point.color}"></span> <b>${point.y:.2f}M </b>'
                },

                series: [{
                    name: "Sales",
                    colorByPoint: true,
                    data: fieldArray
                }]
            });
        });

    });

    //    end hyperCube BarChart ---------------------------------------------------
    //  })
    //    create cubes with a bootstrap table
    app.createCube({
        "qInitialDataFetch": [
            {
                "qHeight": 70,
                "qWidth": 7
            }
        ],
        "qDimensions": [
            {
                "qDef": {
                    "qFieldDefs": [
                        "Invoice Number"
                    ]
                },
                "qNullSuppression": true,
                "qOtherTotalSpec": {
                    "qOtherMode": "OTHER_OFF",
                    "qSuppressOther": true,
                    "qOtherSortMode": "OTHER_SORT_DESCENDING",
                    "qOtherCounted": {
                        "qv": "5"
                    },
                    "qOtherLimitMode": "OTHER_GE_LIMIT"
                },
            },
            {
                "qDef": {
                    "qFieldDefs": [
                        "Order Number"
                    ]
                },
                "qNullSuppression": true,
                "qOtherTotalSpec": {
                    "qOtherMode": "OTHER_OFF",
                    "qSuppressOther": true,
                    "qOtherSortMode": "OTHER_SORT_DESCENDING",
                    "qOtherCounted": {
                        "qv": "5"
                    },
                    "qOtherLimitMode": "OTHER_GE_LIMIT"
                }
            },
            {
                "qDef": {
                    "qFieldDefs": [
                        "Customer"
                    ]
                }
            },
            {
                "qDef": {
                    "qFieldDefs": [
                        "Invoice Date"
                    ]
                }
            },
            {
                "qDef": {
                    "qFieldDefs": [
                        "Promised Delivery Date"
                    ]
                }
            }
        ],

        "qMeasures": [{
            "qDef": {
                "qDef": "sum([Sales Amount])",
                qlabel: "Sales Amount"
            },  
            //            "qLibraryId": "", 
            //            "qSortBy": {  
            //                "qSortByNumeric": 1  

            "qSortCriterias":[{  
                "qSortByExpression": "sum([Sales Amount])"
            }]
        },{
            "qDef": {
                "qDef": "Sum ([Sales Quantity])",
                qlabel: "Sales Quantity"
            }
        }
                     ]
    },function(reply){
        var fieldArray = [];
        var defArray = [];
        var arr1 = [];
        var arr2 = [];
        var arr3 = [];
        var arr4 = [];
        var arr5 = [];

        //Regex for createing commas to a string of numbers
        String.prototype.commafy = function () {
            return this.replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
                return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,");
            });
        };

        var sales = (reply.qHyperCube.qGrandTotalRow[0].qText);
        sales = sales.commafy();
        $("#totalSales").text("$"+sales);
        var qty = (reply.qHyperCube.qGrandTotalRow[1].qNum);
        qty = Math.round(qty);
        qty = qty.toString();
        qty = qty.commafy();
        $("#totalQty").text(qty);
        $.each(reply.qHyperCube.qDataPages[0].qMatrix, function(index, value) {

            if (!this[0].qIsEmpty){
                defArray.push(this[0].qText);
                fieldArray.push(this[1].qText);
                arr1.push(this[2].qText);
                arr2.push(this[3].qText);
                arr3.push(this[4].qText);
                arr4.push(this[5].qNum);
                arr5.push(this[6].qNum);
            }

        });
        //Start d3 chart
        $("#trans").empty();
        //create the pie chart
        for (i=0; i<=defArray.length; i++) {
            $("#trans").append('<tr><td>'+defArray[i]+'</td><td>'+fieldArray[i] +'</td><td>'+arr1[i] +'</td><td>'+arr2[i] +'</td><td>'+arr3[i] +'</td><td>'+"($"+arr4[i] +')</td><td>'+arr5[i] +'</td></tr>'); 
        }
        // app.destroySessionObject(reply.qInfo.qId);
    });
    //end hyperCube table ---------------------------------------------------




    //creating a hyperCube with % line -----------------------------------------
    app.createCube({
        qDimensions: [{
            qDef: {
                qFieldDefs: ["Product Line Desc"]
            }
        }],
        qMeasures: [{
            qDef: {
                qDef: "sum([Sales Amount])"
            }
        }],

        qInitialDataFetch: [{
            qHeight: 2,
            qWidth: 2
        }]

    }, function(reply){

        //console.log("2--------------------------", reply);
        var arr = [];
        var total = (reply.qHyperCube.qGrandTotalRow[0].qNum);
        $.each(reply.qHyperCube.qDataPages[0].qMatrix, function(index, value) {

            //So it will display the right amount e.g $18.2M and not 1823124.09
            var food = this[0].qNum;
            var num = this[1].qNum;
            arr.push(num);

            //create the pie chart
        });
        //insert code here
        var food = arr[0] / total;
        var drink = arr[1] / total;
        food = Math.ceil((food) * 100);
        drink = Math.floor((drink) * 100);
        $("#food").empty().append(food + "% Food").css("width", food +"%");
        $("#drink").empty().append(drink + "% Drink").css("width", drink+"%");
    });

    //    end hyperCube BarChart ---------------------------------------------------
    //  })


    //    create cube with bubblechart
    app.createCube({
        "qInitialDataFetch": [
            {
                "qHeight": 20,
                "qWidth": 7
            }
        ],
        "qDimensions": [
            {
                "qDef": {
                    "qFieldDefs": [
                        "Product Group Desc"
                    ]
                }
            }
        ],
        "qMeasures": [{
            "qDef": {
                "qDef": "Sum ({<[Product Group Desc]={*}>}[Sales Margin Amount])/Sum ({<[Product Group Desc]={*}>}[Sales Amount])",
                qlabel: "GPM%"
            },  
            "qSortCriterias":[ {  
                "qSortByNumeric": 1
            }  ]
        },{
            "qDef": {
                "qDef": "sum({<[Product Group Desc]={*}>} [Sales Amount])",
                qlabel: "Sales"
            }
        }
                     ]
    },function(reply){
        var arr1 = [];
        var arr2 = [];
        var arr3 = [];
        var arrM = [];
        var arrPercent= [];
        //Regex for createing commas to a string of numbers
        String.prototype.commafy = function () {
            return this.replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
                return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,");
            });
        };
        //$("#totalQty").text(qty);
        $.each(reply.qHyperCube.qDataPages[0].qMatrix, function(index, value) {
            if (!this[0].qIsEmpty){
                arr1.push(this[0].qText);
                arr2.push(this[1].qNum);
                arr3.push(this[2].qNum);
            }
        });
        //convert to percent
        for(i = 0; i < arr2.length; i++){
            arr2[i] = Math.floor((arr2[i]) * 100);
            arrPercent.push(arr2[i]);
        }
        //convert to million
        for(i = 0; i < arr3.length; i++){
            arr3[i] = Math.round(arr3[i]);
            arr3[i] = arr3[i].toString();
            arr3[i] = arr3[i].commafy();
            //            arr3[i] = arr3[i].replace(/((\")|(\"))/g,"");
            arr3[i] = parseFloat(arr3[i]);
            arrM.push(arr3[i]);
        }


        $(function () {
            var series = [];

            series = generateData(arrPercent, arr1, arrM);
            function generateData(percent, names, sales) {
                var ret = {},
                    ps = [],
                    series = [],
                    len = percent.length;

                //concat to get point
                for (var i = 0; i < len; i++) {
                    ps[i] = {
                        x: percent[i],
                        y: sales[i],
                        n: names[i]
                    };
                }
                names = [];
                //generate series and split point
                for (i = 0; i < len; i++) {
                    var p = ps[i],
                        sIndex = $.inArray(p.n, names);

                    if (sIndex < 0) {
                        sIndex = names.push(p.n) - 1;
                        series.push({
                            name: p.n,
                            data: []
                        });
                    }
                    series[sIndex].data.push(p);
                }
                return series;
            }
            $('#bubbleChart').highcharts({
                chart: {
                    type: 'bubble',
                    zoomType: 'xy'
                },
                credits:{
                    enabled: false  
                },
                xAxis: {
                    title: {
                        enabled: true,
                        text: 'GPM%'
                    },
                    startOnTick: true,
                    endOnTick: true,
                    showLastLabel: true
                },
                yAxis: {
                    title: {
                        text: 'Sales ($)'
                    }
                },
                title: {
                    text: 'Total Sales vs. Gross Profit Margin %'
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: ' Sales: ${point.y}M , GPM%: {point.x} %'
                },
                series: series
            });


        });
    });


    //    create cube with bubblechart
    app.createCube({
        "qInitialDataFetch": [
            {
                "qHeight": 56,
                "qWidth": 7
            }
        ],
        "qDimensions": [
            {
                "qDef": {
                    "qFieldDefs": [
                        "state_abbr"
                    ]
                }
            }
        ],
        "qMeasures": [{
            "qDef": {
                "qDef": "count(Distinct Customer)",
                qlabel: "Count Costumer"
            }
        }]
    },function(reply){
        var arr1 = [];
        var arr2 = [];

        $.each(reply.qHyperCube.qDataPages[0].qMatrix, function(index, value) {
            if (!this[0].qIsEmpty){
                arr1.push(this[0].qText);
                arr2.push(this[1].qNum);
            }
        });
        //console.log(arr2);
        //convert to percent

        var data = [];
        for (var i = 0; i < arr1.length && arr2.length; i++)
            data.push({"code": arr1[i],
                       "value": arr2[i]});
        $(function () {


            // Instanciate the map
            $('#mcState').highcharts('Map', {

                chart : {
                    borderWidth : 0
                },

                title : {
                    text : 'Customers'
                },
                credits:{
                    enabled: false 
                },
                legend: {
                    layout: 'horizontal',
                    borderWidth: 0,
                    backgroundColor: 'rgba(81,163,136,0.85)',
                    floating: true,
                    verticalAlign: 'top',
                    y: 25
                },
                mapNavigation: {
                    enabled: false
                },

                colorAxis: {
                    min: 1,
                    type: 'logarithmic',
                    minColor: '#EEEEFF',
                    maxColor: '#6C7A89',
                    stops: [
                        [0, '#EFEFFF'],
                        [0.67, '#6C7A89'],
                        [1, '#6C7A89']
                    ]
                },
                plotOptions: {
                    series: {
                        cursor: 'pointer',
                        point: {
                            events: {
                                click: function () {
                                    var dim1 = this.code;
                                    var arr= [];
                                    arr.push(dim1);
                                    app.field("state_abbr").selectValues(arr, true, true);
                                }
                            }
                        }
                    }
                },
                series : [{
                    animation: {
                        duration: 1000
                    },
                    data : data,
                    mapData: Highcharts.maps['countries/us/us-all'],
                    joinBy: ['postal-code', 'code'],
                    dataLabels: {
                        enabled: true,
                        color: 'white',
                        format: '{point.code}'
                    },
                    name: "State",
                    states: {
                        hover: {
                            color: 'rgba(144, 198, 149,0.85)'
                        }
                    },
                    tooltip: {
                        pointFormat: 'Number of customer: {point.value}'
                    }
                }]
            });

        });
    });

    //    create cube with bubblechart
    app.createCube({
        "qInitialDataFetch": [
            {
                "qHeight": 1428,
                "qWidth": 7
            }
        ],
        "qDimensions": [
            {
                "qDef": {
                    "qFieldDefs": [
                        "Sales Rep Name"
                    ]
                }
            },
            {
                "qDef": {
                    "qFieldDefs": [
                        "Product Group Desc"
                    ]
                }
            }
        ],
        "qMeasures": [{
            "qDef": {
                "qDef": "sum({<[Product Group Desc]={*}>} [Sales Amount])",
                qlabel: "Sales"
            },  
            "qSortCriterias":[ {  
                "qSortByNumeric": 1
            }  ]
        }
                     ]
    },function(reply){
        var arr1 = [];
        var arr2 = [];
        var arr3 = [];
        var arrM = [];
        var arrPercent= [];
        //Regex for createing commas to a string of numbers
        String.prototype.commafy = function () {
            return this.replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
                return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,");
            });
        };
        //$("#totalQty").text(qty);
        $.each(reply.qHyperCube.qDataPages[0].qMatrix, function(index, value) {
            if (!this[0].qIsEmpty){
                arr1.push(this[0].qText);
                arr2.push(this[1].qText);
                arr3.push(this[2].qNum);
            }
        });



        $(function () {
            var series = [];

            series = generateData(arr2, arr1, arr3);
            function generateData(percent, names, sales) {
                var ret = {},
                    ps = [],
                    series = [],
                    len = percent.length;

                //concat to get point
                for (var i = 0; i < len; i++) {
                    ps[i] = {
                        product: percent[i],
                        value: sales[i],
                        name: names[i]
                    };
                }
                names = [];
                //generate series and split point
                for (i = 0; i < len; i++) {
                    var p = ps[i],
                        sIndex = $.inArray(p.name, names);

                    if (sIndex < 0) {
                        sIndex = names.push(p.name) - 1;
                        series.push({
                            name: p.name,
                            data: []
                        });
                    }
                    series[sIndex].data.push(p);
                }
                return series;
            }
            var name = [];
            for(var n=0;n<series.length;n++){
                name.push(series[n].name);
            }
            for(var n=0;n<series.length;n++){
                  }
           
            $('#demo').highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Monthly Average Rainfall'
                },
                subtitle: {
                    text: 'Source: WorldClimate.com'
                },
                xAxis: {
                    categories: name,
                    crosshair: true
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Rainfall (mm)'
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                series: [{
                    name: 'Tokyo',
                    data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]

                }, {
                    name: 'New York',
                    data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3]

                }, {
                    name: 'London',
                    data: [48.9, 38.8, 39.3, 41.4, 47.0, 48.3, 59.0, 59.6, 52.4, 65.2, 59.3, 51.2]

                }, {
                    name: 'Berlin',
                    data: [42.4, 33.2, 34.5, 39.7, 52.6, 75.5, 57.4, 60.4, 47.6, 39.1, 46.8, 51.1]

                }]
            });
               

        });
    });
    //Cube ends

    $("#flM").click(function(e) {
        e.stopPropagation();
        // $('#one').toggle();
    });
    $("#flR").click(function(e) {
        e.stopPropagation();
        // $('#one').toggle();
    });
    $("#flS").click(function(e) {
        e.stopPropagation();
        // $('#one').toggle();
    });
    $("#clearAll").click(function() {
        // $('#one').toggle();
        app.clearAll();
        $('.dropdown-toggle').empty();
        $('#m').append("All Months <span class='caret'><span>");
        $('#c').append("All Regions <span class='caret'><span>");
        $('#s').append("All States <span class='caret'><span>");
        //testa = [];
        //this.backendApi.clearSelections();
    });


    $('.navbar-nav a').click(function() {
        //                app.doReload();
        var $linkClicked = $(this).attr('href');
        document.location.hash = $linkClicked;
        if (!$(this).hasClass("current")) {
            $(".navbar-nav a").removeClass("current");
            $(this).addClass("current");
            $('section').hide();
            $($linkClicked).fadeIn();
            return false;
        }
        else {
            return false;
        }
    });
    var hash = window.location.hash;
    hash = hash.replace(/^#/, '');
    switch (hash) {
        case 'two' :
            $("#" + hash + "-link").trigger("click");
            break;
        case 'three' :
            $("#" + hash + "-link").trigger("click");
            break;
        case 'four' :
            $("#" + hash + "-link").trigger("click");
            break;
    }

    if(window.location.hash){
        $(this).addClass("current");
        $('section').hide();
        $(window.location.hash).fadeIn();
        return false;
    }



});
//});
