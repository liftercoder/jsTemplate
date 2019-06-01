/*
 * JSTemplate
 * Author:  Lee Butcher
 * Created: 2019-05-24
 * Version: a0.1.0
 */

var jst = (function () {

    function SimpleDictionary() {

        var _dict = {};

        this.add = function (key, value) {
            _dict[key] = value;
        };

        this.remove = function (key) {
            delete _dict[key];
        };

        this.get = function (key) {
            return { key: key, value: _dict[key] };
        };

        this.getAtIndex = function (index) {

            var keys = Object.keys(_dict);

            return { key: keys[index], value: _dict[keys[index]] };
        };

        this.getAll = function () {
            return _dict;
        };
    }

    var jst = new JSTemplate();

    var _protoPropertyName = "__jst_proto__";

    function JSTemplate() {

        var _dataAttribute = "data-template",
            _dataAttributeSelector = "[" + _dataAttribute + "]";

        var registerTemplateEvent = function (DOMElement, viewModel) {

            var templateData = getDOMElementTemplateData(DOMElement);

            // Only click is supported at the moment
            if (templateData.click) {
                var eventFn = viewModel[templateData.click];
                DOMElement.addEventListener("click", eventFn.bind(viewModel));
            }
        };

        ///
        ///
        ///

        var renderDOMElements = function (viewModel, rootDOMElement) {

            var DOMElements = identifyDOMTemplateElements(rootDOMElement);

            for (var i = 0; i < DOMElements.length; i++) {

                renderDOMElement(DOMElements[i], viewModel);
            }
        };

        var renderDOMElement = function (DOMElement, viewModel) {

            var templateData = getDOMElementTemplateData(DOMElement),
                propertyName = templateData.prop;

            var propertyValue = viewModel[propertyName];

            if (typeof propertyValue === "function" && isObservable(propertyValue)) {
                propertyValue = propertyValue();
            }

            DOMElement.innerHTML = propertyValue;
        };

        ///
        /// Public API
        ///

        this.applyBinds = function (viewModel, rootDOMElement) {

            var DOMTemplateElements = identifyDOMTemplateElements(rootDOMElement);

            for (var i = 0; i < DOMTemplateElements.length; i++) {

                var templateData = getDOMElementTemplateData(DOMTemplateElements[i]);

                var viewModelPropertyName = templateData.prop;

                if (isObservable(viewModel[viewModelPropertyName])) {
                    viewModel[viewModelPropertyName].subscribers.push(DOMTemplateElements[i]);
                }

                registerTemplateEvent(DOMTemplateElements[i], viewModel);
            }

            renderDOMElements(viewModel, rootDOMElement);
        };

        var identifyDOMTemplateElements = function (rootDOMElement) {
            return rootDOMElement.querySelectorAll(_dataAttributeSelector);
        };

        ///
        ///
        ///

        var getDOMElementTemplateData = function (DOMElement) {
            return JSON.parse(DOMElement.getAttribute(_dataAttribute));
        };

        var isObservable = function (instance) {
            return typeof instance == "function" && instance[_protoPropertyName];
        };
    }

    ///
    ///
    ///

    var _latestValuePropertyName = "_latestValue";

    jst.observable = function (data) {

        function observable() {

            if (arguments.length > 0) {

                if (observable[_latestValuePropertyName] != arguments[0]) {
                    observable[_latestValuePropertyName] = arguments[0];

                    observable.notifySubscribers(arguments[0]);
                }

                return this;

            } else {

                return observable[_latestValuePropertyName];
            }
        }

        observable[_protoPropertyName] = jst.observable;

        observable[_latestValuePropertyName] = data;

        observable.subscribers = [];

        observable.notifySubscribers = function (data) {
            for (var i = 0; i < observable.subscribers.length; i++) {
                observable.subscribers[i].innerHTML = data;
            }
        };

        return observable;
    };

    return jst;

}());