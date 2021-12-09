class Animation {
  /**
   * Конструктор класса анимации
   * @param  {int} options.duration - Длительность анимации в милисекундах.
   * @param  {function} options.renderFunction - Функция отрисовки кадра. В качестве
   *                                             параметра принимает показатель
   *                                             прогресса в виде доли от 0 до 1.
   * @param  {function} [options.timingFunction] - Функция зависимости прогресса от
   *                                               времени. На входе принимает долю
   *                                               прошедшего времени (от 0 до 1,
   *                                               экв. %), отдает показатель
   *                                               прогресса (от 0 до 1).
   *                                               По умолчанию линейная.
   * @param  {function} [options.endingFunction] - Фукнция, запускаемая по останвке
   *                                               и окончанию анимации.
   * @param  {int} [options.begin] - Услование автоматического запуска анимации после
   *                                 её определение. Может принимать значение true
   *                                 или 0 (тогда начнется сразу же), либо
   *                                 положительное число в милисекундах (тогда
   *                                 начнется через таймаут).
   * @param  {int} [options.fps] - Целевое количество кадров в секунду.
   */
  constructor({duration, timingFunction, renderFunction, endingFunction, fps, begin}) {
    if (!fps) {
      fps = 24;
    }

    if (timingFunction === `elastic`) {
      timingFunction = this.easeElastic;
    }

    if (timingFunction === `bounce`) {
      timingFunction = this.easeBounce;
    }

    if (typeof timingFunction !== `function`) {
      timingFunction = (timeFraction) => timeFraction;
    }

    if (typeof renderFunction === `function`) {
      this.renderFunction = renderFunction;
    }

    if (typeof endingFunction === `function`) {
      this.endingFunction = endingFunction;
    }

    this.duration = duration;
    this.timingFunction = timingFunction;
    this.fps = fps;

    this._isRunning = false;
    this._previousFrameTime = 0;
    this._execEndingFunction = true;

    // Сохраняем контекст для функции отрисовани кадра
    this.renderFrame = this.renderFrame.bind(this);

    if (begin === true || begin === 0) {
      this.start();
    } else if (begin > 0) {
      setTimeout(() => this.start(), begin);
    }
  }

  /**
   * Запуск анимации.
   * @param  {int} [delay] - Таймаут для запуска. Если не указан, начнется сразу.
   * @return {void}
   */
  start(delay) {
    this._start = performance.now();
    this._isRunning = true;

    if (delay > 0) {
      setTimeout(() => this.start(), delay);
    } else {
      this.renderFrame();
    }
  }

  /**
   * Остановка анимации.
   * @param  {boolean} [execEndingFunction] - Запускать ли функцию завершения
   *                                          анимации после остановки. True —
   *                                          запускать, false — нет.
   *                                          По умолчанию True.
   * @return {void}
   */
  stop(execEndingFunction) {
    if (execEndingFunction) {
      this._execEndingFunction = execEndingFunction;
    }
    this._isRunning = false;
  }

  /**
   * Отрисовка кадра анимации
   * @param  {int} time - Время, прошедшее от загрузки страницы.
   * @return {void}
   */
  renderFrame(time) {
    // Вычисление доли прошедшего времени
    let timeFraction = (time - this._start) / this.duration;
    if (timeFraction > 1) {
      timeFraction = 1;
      this._isRunning = false;
    }

    // Количество времени, прошедшее с отрисовки предыдущег кадра
    const elapsed = time - this._previousFrameTime;
    if (elapsed > (1000 / this.fps) || timeFraction === 1) {
      if (this.renderFunction) {
        this.renderFunction(this.timingFunction(timeFraction));
      }
      this._previousFrameTime = time;
    }

    // Проверка, что анимация не остановлена, либо не прошло время duration
    if (!this._isRunning || (this._start + this.duration) < time) {
      // Если есть завершающая функция и её запуск не выключен, то запустить её
      if (this.endingFunction && this._execEndingFunction) {
        this.endingFunction();
      }
      return;
    }

    // Переход к следующему кадру
    requestAnimationFrame(this.renderFrame);
  }

  easeBounce(timeFraction) {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (timeFraction < 1 / d1) {
      return n1 * timeFraction * timeFraction;
    } else if (timeFraction < 2 / d1) {
      return n1 * (timeFraction -= 1.5 / d1) * timeFraction + 0.75;
    } else if (timeFraction < 2.5 / d1) {
      return n1 * (timeFraction -= 2.25 / d1) * timeFraction + 0.9375;
    } else {
      return n1 * (timeFraction -= 2.625 / d1) * timeFraction + 0.984375;
    }
  }

  easeElastic(timeFraction) {
    const c4 = (2 * Math.PI) / 3;

    if (timeFraction === 0) {
      return 0;
    } else if (timeFraction === 1) {
      return 1;
    } else {
      return Math.pow(2, -10 * timeFraction) *
             Math.sin((timeFraction * 10 - 0.75) * c4) + 1;
    }
  }
}

window.Animation = Animation;