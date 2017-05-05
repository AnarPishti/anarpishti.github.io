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
        brands: BRANDS,
        recentVideos: {
            data: []
        }
    },
    methods: {
        getRecentVideos: getRecentVideos,
        transformNumberUnderHundred: transformNumberUnderHundred,
        selectSeason: selectSeason,
        toDateString: toDateString
    },
    created: getRecentVideos
});

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
        app.$set(app.recentVideos, 'data', videoList);
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
    this.brands[brandIndex].selected = seasonIndex;
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