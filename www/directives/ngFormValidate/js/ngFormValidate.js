/**
 * Created by 赵俊明
 * sm.xy@live.com 15311621031
 * on 2016/3/12.
 * 本校验指令集合内聚angularJs内置检验指令，仅体现业务校验规则，本意是将检验的规则和表现分离。
 * 扩展时注意保证其服务函数完全闭合，不污染全局变量。
 */

angular.module("zs.directives.validateDirective", [], ["$compileProvider", '$provide', function ($compileProvider, $provide) {

        var ZS_VALIDATE_CONSTANT = {
            zsValidateIdcard: {
                validateName: "idCard",
                validateMessage: "请输入十八位公民身份证号码",
                pattern: undefined,
                validateFunction: isIdCardNo
            },
            zsValidatePostalcode: {
                validateName: "postalCode",
                validateMessage: "请输入6位邮政编码",
                pattern: /^[0-9]{6}$/,
                validateFunction: undefined
            },
            zsValidateMobile: {
                validateName: "mobile",
                validateMessage: "请输入11位手机号码",
                pattern: /^(1[0-9]{10})$/,
                validateFunction: undefined
            },
            zsValidateDigits: {
                validateName: "digits",
                validateMessage: "请输入整数",
                pattern: /^\d+$/,
                validateFunction: undefined
            },
            zsValidateStringeen: {
                validateName: "stringEn",
                validateMessage: "请输入字母",
                pattern: /^[A-Za-z]+$/g
            },
            zsValidateStringcn: {
                validateName: "stringCn",
                validateMessage: "请输入汉字",
                pattern: /[^u4E00-u9FA5]/g,
                validateFunction: undefined
            },
            zsValidateAlnum: {
                validateName: "alnum",
                validateMessage: "请输入字母或数字",
                pattern: /^[a-zA-Z0-9]+$/,
                validateFunction: undefined
            },
            zsValidateIp: {
                validateName: "ip",
                validateMessage: "请输入正确ip地址",
                pattern: /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/,
                validateFunction: undefined
            },
            zsValidateUrl: {
                validateName: "url",
                validateMessage: "请输入合法的网络地址",
                pattern: /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
                validateFunction: undefined
            },
            zsValidateAmount: {
                validateName: "amount",
                validateMessage: "请输入正确的金额",
                pattern: /^(-)?(([1-9]{1}\d*)|([0]{1}))(\.(\d){1,2})?$/,
                validateFunction: undefined
            }
        };

        $provide.constant("ZS_VALIDATE_CONSTANT", function () {
            return {
                $get: function () {
                    return ZS_VALIDATE_CONSTANT;
                }
            }
        });

        /** 统一正则表达式校验 **/
        angular.forEach(ZS_VALIDATE_CONSTANT, function (value, key) {
            $compileProvider.directive(key, regexpUnifiedVerificationDirective(key, value));
        });

        /** 正则表达式统一校验指令函数
         *  <input name="mobile" ng-model="mobile" zs-validate-mobile>
         *  <input name="mobile" ng-model="mobile" zs-validate-mobile="true">
         *  <input name="mobile" ng-model="mobile" zs-validate-mobile="false">
         **/

        function regexpUnifiedVerificationDirective(directiveName, validateUnit) {

            return function () {

                return {
                    restrict: "A",
                    require: "?ngModel",
                    link: function (scope, element, attrs, ngModelController) {
                        if (!ngModelController) {
                            return;
                        }
                        var isValidate = true;
                        /** 监听属性值改变 以应对动态的校验规则 **/
                        attrs.$observe(directiveName, function (value) {
                            if (undefined === scope.$eval(attrs[directiveName]) || scope.$eval(attrs[directiveName])) {
                                isValidate = true;
                            } else {
                                isValidate = false;
                            }
                            ngModelController.$validate();
                        });

                        ngModelController.$validators[validateUnit.validateName] = function (modelValue, viewValue) {

                            var validateResult = true;
                            //检验表达式
                            if (!angular.isUndefined(validateUnit.pattern)) {
                                if (angular.isArray(validateUnit.pattern)) {
                                    angular.forEach(validateUnit.pattern, function (pattern) {
                                        validateResult = validateResult && pattern.test(viewValue);
                                    });
                                } else {
                                    validateResult = validateUnit.pattern.test(viewValue);
                                }
                            }
                            //检验函数
                            if (!angular.isUndefined(validateUnit.validateFunction)) {
                                if (angular.isArray(validateUnit.validateFunction)) {
                                    angular.forEach(validateUnit.validateFunction, function (validateFunction) {
                                        validateResult = validateResult && validateFunction(viewValue);
                                    });
                                } else {
                                    validateResult = validateUnit.validateFunction(viewValue);
                                }
                            }

                            return !isValidate || ngModelController.$isEmpty(viewValue) || validateResult;
                        };

                    }
                };

            };

        };

        /**七日校验规则，考虑闰月闰年*/
        function isDate8(sDate) {
            if (!/^[0-9]{8}$/.test(sDate)) {
                return false;
            }
            var year, month, day;
            year = sDate.substring(0, 4);
            month = sDate.substring(4, 6);
            day = sDate.substring(6, 8);
            var iaMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
            if (year < 1700 || year > 2500) return false
            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) iaMonthDays[1] = 29;
            if (month < 1 || month > 12) return false
            if (day < 1 || day > iaMonthDays[month - 1]) return false
            return true;
        };

        /**校验身份证 根据地区 校验位 计算公式*/
        function isIdCardNo(num) {
            if (angular.isUndefined(num)) {
                return true;
            }
            var factorArr = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1);
            var parityBit = new Array("1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2");
            var varArray = new Array();
            var intValue;
            var lngProduct = 0;
            var intCheckDigit;
            var intStrLen = num.length;
            var idNumber = num;
            // 判断19位
            if (intStrLen != 18) {
                return false;
            }
            // 检验数字和最后一位字母
            for (i = 0; i < intStrLen; i++) {
                varArray[i] = idNumber.charAt(i);
                if ((varArray[i] < '0' || varArray[i] > '9') && (i != 17)) {
                    return false;
                } else if (i < 17) {
                    varArray[i] = varArray[i] * factorArr[i];
                }
            }

            //8位日期检查
            var date8 = idNumber.substring(6, 14);
            if (isDate8(date8) == false) {
                return false;
            }
            // calculate the sum of the products
            for (i = 0; i < 17; i++) {
                lngProduct = lngProduct + varArray[i];
            }
            // calculate the check digit
            intCheckDigit = parityBit[lngProduct % 11];
            // check last digit
            if (varArray[17] != intCheckDigit) {
                return false;
            }
            return true;
        };


    }])
    .factory("$ModelValidationHandler", ["ZS_VALIDATE_CONSTANT", function (ZS_VALIDATE_CONSTANT) {

        return function (validateForm) {

            return true;
        };

    }])
    .factory("$FormValidationHandler", ["ZS_VALIDATE_CONSTANT", function (ZS_VALIDATE_CONSTANT) {

        return function (validateForm) {

            return true;
        };

    }]);