(function ($) {
    //Параметры по умолчанию
    var defaults = {
        //Класс, который добавляется, если поле заполнено неверно
        classErrorMessage: 'v-error',
        //Класс, если поле заполнено с ошибкой
        classBgError: 'v-bg-error',
        //Класс, если поле заполнено правитьно
        classSuccessMessage: 'v-success',
        //Добавлять ли readonly к полям, которые уже заполнены верно
        successFieldDisabled: true,
        //Класс, добавляемый к полю вместе с атрибутом readonly
        classDisabled: 'v-disabled'
    };

    //Текущие настройки (они используются при работе плагина)
    var options;

    $.fn.validForm = function (params) {
        //Собираем актуальные параметры плагина
        options = $.extend({}, defaults, options, params);


        /**
         * Валидатор для проверки полей типа "string"
         *
         * @param itemForm Поле для ввода
         * @return {boolean} Флаг правильности заполнения конкретного поля
         */
        function validatorString(itemForm) {
            //Флаг, отвечающий за прохождение валидации полем
            var isOk = true;
            //Значените поле, которое будет проходить валидацию
            var value = $(itemForm).val();

            //Получаем атрибуты поля, определяющие валидацию
            var dataRequired = $(itemForm).attr('data-v-required');
            var dataMinString = $(itemForm).attr('data-v-min');
            var dataMaxString = $(itemForm).attr('data-v-max');
            var dataPattern = $(itemForm).attr('data-v-pattern');

            //1. Если поле обязательно к заполнению и не заполнено
            if (dataRequired && dataRequired !== "false" && value.length === 0) {
                isOk = false;
            }

            //2. Если задан параметр dataMinString, то проверяем строку на минимальное кол-во символов
            if (!(dataMinString && value.length >= dataMinString) && value.length) {
                isOk = false;
            }

            //3. Если задан параметр dataMaxString, то проверяем строку на максимальное кол-во символов
            if (!(dataMaxString && value.length <= dataMaxString) && value.length) {
                isOk = false;
            }

            //4. Если задано регулярное выражение в параметре dataPattern
            if (dataPattern && value.length) {
                var regExpression = new RegExp(dataPattern, 'i');
                if (!regExpression.test(value)) {
                    isOk = false;
                }
            }

            return isOk;
        }

        /**
         * Валидатор для полей типа "pattern"
         *
         * @param item Поле для ввода
         * @return {boolean} Флаг правильности заполнения конкретного поля
         */
        function validatorPattern(item) {
            var isOk = true;
            var value = $(item).val();

            var dataPatternRequired = $(item).attr('data-v-required');
            var dataPattern = $(item).attr('data-v-pattern');

            //1. Если поле обязательно к заполнению и не заполнено
            if (dataPatternRequired && dataPatternRequired !== "false" && value.length === 0) {
                isOk = false;
            }

            //2. Если задано регулярное выражение
            if (dataPattern && value.length > 0) {
                var regExpression = new RegExp(dataPattern, 'i');
                if (!regExpression.test(value)) {
                    isOk = false;
                }
            }

            return isOk;
        }

        /**
         * Валидатор для полей типа "number".
         *
         * @param item Поле для ввода
         * @return {boolean} Флаг правильности заполнения конкретного поля
         */
        function validatorNumber(item) {
            var isOk = true;
            var value = $(item).val();

            var dataRequired = $(item).attr('data-v-required');
            var dataMinNumber = parseInt($(item).attr('data-v-min'));
            var dataMaxNumber = parseInt($(item).attr('data-v-max'));

            //1. Если поле обязательно к заполнению и не заполнено
            if (dataRequired && dataRequired !== "false" && value.length === 0) {
                isOk = false;
            }

            //2. Если задано минимально допустимое кол-во символов в качестве значения
            if (!(dataMinNumber !== undefined && !isNaN(dataMinNumber) && value >= dataMinNumber) && value.length) {
                isOk = false;
            }

            //3. Если задано максимально допустимое кол-во символов в качестве значения
            if (!(dataMaxNumber !== undefined && !isNaN(dataMaxNumber) && value <= dataMaxNumber) && value.length) {
                isOk = false;
            }


            return isOk;
        }

        /**
         * Валидатор для проверки полей типа "email".
         *
         * @param item item Поле для ввода
         * @return {boolean} Флаг правильности заполнения конкретного поля
         */
        function validatorEmail(item) {
            var isOk = true;
            var value = $(item).val();

            var dataRequired = $(item).attr('data-v-required');

            //1. Если поле обязательно к заполнению и не заполнено
            if (dataRequired && dataRequired !== "false" && value.length === 0) {
                isOk = false;
            }

            //2. Проверка E-mail на соответствие регулярному выражению
            if (value.length > 0) {
                //mail.mail.mail.mail@domain.com.ru
                var regExpression = /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/i;
                if (!regExpression.test(value)) {
                    isOk = false;
                }
            }

            return isOk;
        }


        //Вывод результата валидации
        function resultValidator(item, isOk, successMessage, errorMessage) {
            var $item = $(item);
            var $nextItem = $item.next();

            //Удаляем контейнер с прошлым сообщением, если валидация осуществляется не в первый раз
            if ($nextItem.hasClass(options.classErrorMessage)
                || $nextItem.hasClass(options.classSuccessMessage)) {
                $nextItem.remove(); //Удаляем контейнер
            }


            //Создадим новый контейнер для сообщения
            var $resultContainer = $('<div />', {
                class: (isOk) ? options.classSuccessMessage : options.classErrorMessage,
                text: (isOk) ? successMessage : errorMessage
            });
            //Добавляем созданный контейнер в DOM
            $resultContainer.insertAfter($item);

            //Нужно ли добавлять атрибут readonly
            if (options.successFieldDisabled && isOk) {
                $item.attr('readonly', 'readonly')
                    .addClass(options.classDisabled)
                    .removeClass(options.classBgError);
            }

            //Если поле запонено не правильно
            if (!isOk) {
                $item.addClass(options.classBgError);
            }
        }

        //Перебор элементов jQuery с помощью each
        // return - для сохранения цепочек вызовов в jQuery
        return this.each(function (index, item) {
            //Удаляем disabled, если поле заблокировано
            $(item).on('click', 'input', function () {
                var $element = $(this);
                if ($element.attr('readonly')) {
                    $element.attr('readonly', null).removeClass(options.classDisabled);
                }

                //Удаление класса, который возможно был добавлен при ошибке
                $element.removeClass(options.classBgError);
            });

            //Навешиваем функцию обработчик на событие submit - отправка формы
            $(item).on('submit', function (event) {
                var isOk = false; //Правильно ли заполнено поле

                //Выбираем только поля формы, которые содержат атрибут data-v-validator
                var fields = $(this).find('*[data-v-validator]');

                //Флаг, отправить ли форму
                var isFormValid = true;

                //Перебираем поля формы и применяем валидаторы
                fields.each(function (index, item) {
                    //Валидатор
                    var dataValidator = $(item).attr('data-v-validator');
                    //Сообщение об успешном заполнении поля
                    var dataSuccess = $(item).attr('data-v-success') || 'Поле заполнено верно';
                    //Сообщение об ошибке
                    var dataError = $(item).attr('data-v-error') || 'Поле заполнено неверно';

                    //Проверки
                    switch (dataValidator) {
                        //Валидатор string
                        case 'string':
                            isOk = validatorString(item);
                            resultValidator(item, isOk, dataSuccess, dataError);
                            break;
                        //Валидатор number
                        case 'number':
                            isOk = validatorNumber(item);
                            resultValidator(item, isOk, dataSuccess, dataError);
                            break;
                        //Валидатор email
                        case 'email':
                            isOk = validatorEmail(item);
                            resultValidator(item, isOk, dataSuccess, dataError);
                            break;
                        //Валидатор pattern
                        case 'pattern':
                            isOk = validatorPattern(item);
                            resultValidator(item, isOk, dataSuccess, dataError);
                            break;
                        default:
                            console.log('Валидатора', dataValidator, 'не существует.');
                            console.log('Поле формы:', $(item).attr('name') || $(item).attr('id'));
                            isOk = false; //Форма не должна быть отправлена
                    }

                    //Если поле заполнено не правильно
                    if (!isOk) {
                        isFormValid = false;
                    }
                });

                //Если форма заполнена неверно, отменяем отправку
                if (!isFormValid) {
                    event.preventDefault(); //Отмена действия браузера по умолчанию
                }

            });
        });
    }

})(jQuery);