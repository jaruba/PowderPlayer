var asyncblock = require('asyncblock');
var utility = require('./utility.js');

var x = function(){ return { x: function() { } } };

exports.lineCountMaintained = module.__asyncblock_lineCountMaintained;
exports.content = module.__asyncblock_content;

exports.test = function(callback){
    asyncblock(function(flow){

        var a1 = utility.echo('test').defer();
        var a2 = utility.echo('test').defer();
        var a3 = utility.echo('test').defer();

        var a4 = {
            a1: a1,
            a2: a2,
            a3: a3
        };

        var i = { //a1
            b: 3, //2
            a: (2 - 1) //3
        }; //4

        if(x //1
            && //2
            x && //3
            x //4
            )//5
        {//6
            //7
        }//8

        x();
        (function(){})();

        var a = { //1
            a: 1, //2
            b: [] //3
        }; //4

        var //1
            q = 1, //1
            t;//2

        var //1
            comment = 1; //2

        '1' + '2' + //1
        '3' //2

        x = //1
            x; //2

        var p = x({ //1
            userInfo: x.x //2
        }); //3

        switch(x) //0
        { //1
            case 1: //2
                var a = 1; //3
                try{ //4
    //5
                } finally { //6
    //7
                }//8
    //9
        }//10

        x({
            c: false //1
        });

        var t = function(/*a*/a, /*b*/b /*c*/, c /*d*/){

        };

        /*t();var u = 1; // causes error*/

        /*
         t(

         ); //causes error
         */

        var y //1
            = //2
            function() //3
            { //4
    //5
            }; //6

        var a = 1 //1
            ? //2
            2 //3
            : //4
            3; //5

        var //1
            f = 1, //2
            g //3
                = //4
                2 //5
            , //6
            h, //7
            i = //8
                3; //9

        var e = { //a1
            a: //a2
                1 //a3
        }; //a4

        if(x) // 1
        { // 2
            //3
        } //4
        else if(x) //5
        { //6
            //7
        } //8
        else if(x){ //9
            //10
        } //11
        else // 12
        { //13
            //14
        } //15

        var d = 1 //1
            + //2
            2 //3

        var c = new //1
            x( //2
            1, //3
            2 //4
        ) //5

        x //arr access
            [ //arr 1
            1 //arr 2
            ] //arr end

        var b = //1
            [ //2
                "a", //3
                2 //4
                , 3 //5
            ] //6

        var a = //x
            '1' //1

                + //2
                'b' //3

        x() //x1
            .x() //x2

        x(). //x1
            x() //x2

        try //pre-try
        {
            //in try
        } //post-try
        catch(e) //pre-catch
        {
            //in catch
        } //post-catch
        finally //pre-finally
        {
            //in finally
        } //post finally



        switch(x){ //1
            case 1: //2
            default: //3
        } //4

        x(
            1, //1
            2 //2
        ); //remove for error

        var a = { //asdf1
            a: 1, //asdf2
            b: 2 //asdf3
        } //asdf4

        if(x){

        } //test
        else{ //test1
        }

        callback(null, utility.echo('test').defer());

        return
    });
};



