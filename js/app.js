var API_HOST = 'anarpishtifunc.azurewebsites.net';

var BRANDS = [{
    name: '石榴熟了',
    slag: 'anar',
    selected: 0
}, {
    name: '奇葩古丽',
    slag: 'qipar',
    selected: 0
}];

var app = new Vue({
    el: '#anar_app',
    data: {
        brands: {
            data: BRANDS
        },
        videoList: {
            data: []
        },
        path: {
            data: 'home'
        }
    },
    methods: {
        getRecentVideos: getRecentVideos,
        transformNumberUnderHundred: transformNumberUnderHundred,
        selectSeason: selectSeason,
        toDateString: toDateString,
        getBrandVideos: getBrandVideos
    },
    created: function() {
        window.onhashchange = handlePath;
        setTimeout(handlePath, 0);
    }
});

function handlePath() {
    var routes = [{
        do: app.getRecentVideos
    }, {
        path: '/video/(.*?)',
        do: function(matches) {
            app.getBrandVideos(matches[1]);
        }
    }];

    var matched = false;
    var path = location.hash;
    path = path ? path.substr(1) : '';
    routes.forEach(function(route) {
        if (matched) {
            return;
        }
        
        if (route.path && new RegExp('^' + route.path + '$').test(path)) {
            route.do(path.match(new RegExp('^' + route.path + '$')));
            app.$set(app.path, 'data', path);
            matched = true;
        }
    });
    if (!matched) {
        app.$set(app.path, 'data', 'home');
        routes[0].do();
    }
}

function getRecentVideos() {
    var url = 'https://' + API_HOST + '/api/video/get';
    jQuery.get(url).done(function(res) {
        var videoList = [];
        res.data.forEach(function(brandVideos) {
            brandVideos.sort(function(a, b){
                return b[0].season - a[0].season;
            });
            videoList.push(brandVideos);
        });
        BRANDS.forEach(function(brand) {
            brand.selected = 0;
        });
        app.$set(app.brands, 'data', BRANDS);
        app.$set(app.videoList, 'data', videoList);
    }).fail(function(error) {

    });
}

function transformNumberUnderHundred(num) {
    var CHINESE_NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

    if (num < 1 || num > 99) {
        return null;
    }

    if (num <= 10) {
        return CHINESE_NUM[num - 1];
    }

    var c = Math.floor(num / 10);

    if (c === 1) {
        return '十' + CHINESE_NUM[num % 10 - 1];
    } else {
        return CHINESE_NUM[c - 1] + '十' + (num % 10 === 0 ? '' : CHINESE_NUM[num % 10 - 1]);
    }
}

function selectSeason(brandIndex, seasonIndex) {
    this.brands.data[brandIndex].selected = seasonIndex;
}

function isNewVideo(time) {
    return new Date().getTime() / 1000 - time < 7 * 24 * 3600;
}

function toDateString(timespan) {
    var publishTime = new Date(timespan * 1000);
    var year = publishTime.getFullYear();
    var month = publishTime.getMonth() + 1;
    var day = publishTime.getDate();
    month = month < 10 ? ('0' + month) : month;
    day = day < 10 ? ('0' + day) : day;
    return year + '.' + month + '.' + day;
}

function getBrandVideos(brand) {
    var url = 'https://' + API_HOST + '/api/video/get?brand=' + brand;
    jQuery.get(url).done(function(res) {
        var videoList = [];
        res.data.sort(function(a, b){
            return b[0].season - a[0].season;
        });
        videoList.push(res.data);
        BRANDS.forEach(function(b) {
            if (b.slag === brand) {
                b.selected = 0;
                app.$set(app.brands, 'data', [b]);
            }
        });
        app.$set(app.videoList, 'data', videoList);
    }).fail(function(error) {

    });
}