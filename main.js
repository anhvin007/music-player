const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const player = $('.player');
const heading = $('header h2');
const thumbnail = $('.cd .cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextSongBtn = $('.btn-next');
const prevSongBtn = $('.btn-prev');
const repeatSongBtn = $('.btn-repeat');
const randomSongBtn = $('.btn-random');
const playList = $('.playlist');
const PLAYER_STORAGE = "ORC_PLAYER";

const app = {
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE)) || {},
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    setConfig: function(key, value) {
        app.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE, JSON.stringify(this.config));
    },
    songs: [
        {
            name: "Glimpse of Us",
            singer: "Joji",
            path: './assets/music/Joji - Glimpse of Us.mp3',
            thumbnail: './assets/thumbnail/Joji_-_Glimpse_of_Us.png'
        },
        {
            name: "Thuận theo ý trời",
            singer: "Bùi Anh Tuấn",
            path: './assets/music/Thuan Theo Y Troi - Bui Anh Tuan [Lossless FLAC].mp3',
            thumbnail: './assets/thumbnail/thuan-theo-y-troi.jpg'
        },
        {
            name: "Thanh xuân",
            singer: "Dalab",
            path: './assets/music/Thanh Xuan - Dalab.mp3',
            thumbnail: './assets/thumbnail/thanh-xuan.jpg'
        },
        {
            name: "Everybody dies in their nightmares",
            singer: "XXXTentacion",
            path: './assets/music/Everybody Dies In Their Nightmares (Panciuck Remix).mp3',
            thumbnail: './assets/thumbnail/nightmares.jpg'
        },
        {
            name: "Bước qua nhau",
            singer: "Vũ",
            path: './assets/music/Buoc qua nhau ... Vũ.mp3',
            thumbnail: './assets/thumbnail/buoc-qua-nhau.jpg'
        },
        {
            name: "Mơ hồ",
            singer: "Bùi Anh Tuấn",
            path: './assets/music/Mo Ho - Bui Anh Tuan.mp3',
            thumbnail: './assets/thumbnail/mo-ho.jpg'
        },
        {
            name: "2 5",
            singer: "Táo",
            path: './assets/music/TÁO 2 5 Live at HỘI.mp3',
            thumbnail: './assets/thumbnail/25.jpg'
        },
        {
            name: "Thức giấc",
            singer: "Dalab",
            path: './assets/music/Thức giấc - Dalab.mp3',
            thumbnail: './assets/thumbnail/thuc-giac.jpg'
        }
    ],
    renderSong: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index == this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.thumbnail}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        });
        playList.innerHTML = htmls.join('');
    },  
    handleEvents: function() {
        const cdWidth = cd.offsetWidth;
        // Xử lý phóng to, thu nhỏ CD
        document.onscroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // Xử lý quay CD
        const thumbCdRotate = thumbnail.animate([
            {
                transform: 'rotate(360deg)', 
            }
        ], {
            duration: 20000,
            iterations: Infinity,
        });
        thumbCdRotate.pause();

        // Xử lý next song
        nextSongBtn.onclick = () => {
            if(app.isRandom) {
                app.randomSong();
            }
            else {
                app.nextSong();
            }
            audio.play();
            app.renderSong();
            app.scrollSongToView();
        }

        // Xử lý prev song
        prevSongBtn.onclick = () => {
            if(app.isRandom) {
                app.randomSong();
            }   
            else {
                app.prevSong();
            }
            audio.play();
            app.renderSong();
            app.scrollSongToView();
        }

        // Xử lý repeat song
        repeatSongBtn.onclick = () => {
            app.isRepeat = !app.isRepeat;
            app.setConfig('isRepeat', app.isRepeat);
            repeatSongBtn.classList.toggle('active', app.isRepeat);
        }

        // Xử lý random song
        randomSongBtn.onclick = () => {
            app.isRandom = !app.isRandom;
            app.setConfig('isRandom', app.isRandom);
            randomSongBtn.classList.toggle('active', app.isRandom);
        }

        // Xử lý khi click Play
        playBtn.onclick = () => {
            if(app.isPlaying) {
                audio.pause();
                thumbCdRotate.pause();
            }
            else {
                audio.play();
                thumbCdRotate.play();
            }

            // Xử lý thay đổi tiến độ bài hát
            audio.ontimeupdate = () => {
                if(audio.duration) {
                    const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                    progress.value = progressPercent;
                }
            }

            // Xử lý tua song
            progress.onchange = (e) => {
                const seekTime = e.target.value / 100 * audio.duration;
                audio.currentTime = seekTime;
            } 
        };

        // Xử lý khi song đang pause
        audio.onpause = () => {
            app.isPlaying = false;
            player.classList.remove('playing');
        }
        // Xử lý khi song đang play
        audio.onplay = () => {
            app.isPlaying = true;
            player.classList.add('playing');
        }

        // Xử lý audio khi end
        audio.onended = () => {
            // thumbCdRotate.pause();
            if(app.isRepeat) {
                audio.play();
            }
            else {
                nextSongBtn.click();
            }
        }

        // Lắng nghe hành vi click vào playlist
        playList.onclick = (e) => {
            const songNode = e.target.closest('.song:not(.active)');
            if(songNode || e.target.closest('.option')) {
                // Khi click vào song
                if(songNode) {
                    app.currentIndex = songNode.dataset.index;
                    app.loadCurrentSong();
                    app.renderSong();
                    audio.play();
                }
                // Khi click vào option
                if (e.target.closest('.option')) { 

                }
            }
        }
    },
    defineProperties: function() {
        Object.defineProperty(this, "currentSong", {
            get: function() {
                return this.songs[this.currentIndex];
            }
        });
    },
    scrollSongToView:function() {
        setTimeout(() => {
            if(this.currentIndex == 0) {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                })
            } 
            else { 
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }, 500);
    },
    loadCurrentSong: function() {
        heading.textContent = app.currentSong.name;
        thumbnail.style.backgroundImage = `url('${app.currentSong.thumbnail}')`;
        audio.src = app.currentSong.path;
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    randomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while(newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function() {
        // load config
        this.loadConfig();

        // Định nghĩa các thuộc tính cho Object
        this.defineProperties();

        // Xử lý các sự kiện DOM events
        this.handleEvents();

        // tải thông tin bài hát ở playlist
        this.renderSong();
   
        // tải thông tin bài hát hiện tại
        this.loadCurrentSong();
        
        // Hiển thị trạng thái ban đầu của random và repeat
        repeatSongBtn.classList.toggle('active', app.isRepeat);
        randomSongBtn.classList.toggle('active', app.isRandom);

    }
}

app.start();