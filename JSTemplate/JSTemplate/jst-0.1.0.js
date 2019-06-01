/*
 * JSTemplate
 * Author:  Lee Butcher
 * Created: 2019-05-24
 * Version: a0.1.0
 */

var jst = (function () {

    var jst = new JSTemplate();

    var _protoPropertyName = "__jst_proto__";

    ///
    /// ~ctr
    ///

    function JSTemplate() {

        var _dataAttribute = "data-template",
            _dataAttributeSelector = "[" + _dataAttribute + "]";

        ///
        /// Events
        ///

        var registerTemplateEvent = function (DOMElement, viewModel) {

            var templateData = getDOMElementTemplateData(DOMElement);

            // Only click is supported at the moment
            if (templateData.click) {

                var eventFn = viewModel[templateData.click];
                DOMElement.addEventListener("click", eventFn.bind(viewModel));
            }
        };

        ///
        /// DOM
        ///

        var renderDOMElements = function (viewModel, rootDOMElement) {

            var DOMElements = identifyDOMTemplateElements(rootDOMElement);

            for (var i = 0; i < DOMElements.length; i++) {
                renderDOMElement(DOMElements[i], viewModel);
            }
        };

        var renderDOMElement = function (DOMElement, viewModel) {

            var templateData = getDOMElementTemplateData(DOMElement)
              , propertyName = templateData.prop
              , propertyValue = viewModel[propertyName];

            if (typeof propertyValue === "function" && isObservable(propertyValue)) {
                propertyValue = propertyValue();
            }

            DOMElement.innerHTML = propertyValue;
        };

        ///
        /// Template parsing
        ///

        var identifyDOMTemplateElements = function (rootDOMElement) {
            return rootDOMElement.querySelectorAll(_dataAttributeSelector);
        };

        var getDOMElementTemplateData = function (DOMElement) {

            var templateData = DOMElement.getAttribute(_dataAttribute)
              , pairs = templateData.replace(" ", "").replace("{", "").replace("}", "").split(",")
              , obj = {};

            for (var i = 0; i < pairs.length; i++) {

                var pair = pairs[i]
                  , keyValue = pair.split(":");

                obj[keyValue[0]] = keyValue[1];
            }

            return obj;
        };

        ///
        /// Public API
        ///

        this.applyBinds = function (viewModel, rootDOMElement) {

            var DOMTemplateElements = identifyDOMTemplateElements(rootDOMElement);

            for (var i = 0; i < DOMTemplateElements.length; i++) {

                var templateData = getDOMElementTemplateData(DOMTemplateElements[i])
                  , viewModelPropertyName = templateData.prop;

                if (isObservable(viewModel[viewModelPropertyName])) {
                    viewModel[viewModelPropertyName].subscribers.push(DOMTemplateElements[i]);
                }

                registerTemplateEvent(DOMTemplateElements[i], viewModel);
            }

            renderDOMElements(viewModel, rootDOMElement);
        };
    }

    ///
    /// Observables
    ///

    var _latestValuePropertyName = "_latestValue";

    var isObservable = function (instance) {
        return typeof instance == "function" && instance[_protoPropertyName];
    };

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

    ///
    /// Export
    ///

    return jst;

}());