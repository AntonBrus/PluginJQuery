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

        //Методы для осуществления валидации

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
            if(dataRequired && value.length === 0){
                isOk = false;
            }

            return isOk;
        }

        //2. Другие валидаторы

        //Вывод результата валидации
        function resultValidator(item, isOk, successMessage, errorMessage) {
            var $item = $(item);
            var $nextItem = $item.next();

            //Удаляем контейнер с прошлым сообщением, если валидация осуществляется не в первый раз
            if ($nextItem.hasClass(options.classErrorMessage)
                || $nextItem.hasClass(options.classSuccessMessage)){
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
            if(options.successFieldDisabled && isOk){
                $item.attr('readonly', 'readonly')
                    .addClass(options.classDisabled)
                    .removeClass(options.classBgError);
            }

            //Если поле запонено не правильно
            if(!isOk){
                $item.addClass(options.classBgError);
            }
        }

        //Перебор элементов jQuery с помощью each
        // return - для сохранения цепочек вызовов в jQuery
        return this.each(function (index, item) {
            //Удаляем disabled, если поле заблокировано
            $(item).on('click', 'input', function () {
                var $element = $(this);
                if($element.attr('readonly')){
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
                    switch (dataValidator)
                    {
                        //Валидатор string
                        case 'string':
                            isOk = validatorString(item);
                            resultValidator(item, isOk, dataSuccess, dataError);
                            break;

                        default:
                            console.log('Валидатора', dataValidator, 'не существует.');
                            console.log('Поле формы:', $(item).attr('name') || $(item).attr('id'));
                            isOk = false; //Форма не должна быть отправлена
                    }

                    //Если поле заполнено не правильно
                    if(!isOk){
                        isFormValid = false;
                    }
                });

                //Если форма заполнена неверно, отменяем отправку
                if(!isFormValid){
                    event.preventDefault(); //Отмена действия браузера по умолчанию
                }

            });
        });
    }

})(jQuery);