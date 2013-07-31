/*
** Annotator 1.2.5-dev-b83d51d
** https://github.com/okfn/annotator/
**
** Copyright 2012 Aron Carroll, Rufus Pollock, and Nick Stenning.
** Dual licensed under the MIT and GPLv3 licenses.
** https://github.com/okfn/annotator/blob/master/LICENSE
**
** Built at: 2013-07-29 15:45:33Z
*/


(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Annotator.Plugin.Time = (function(_super) {
    var intRegex;

    __extends(Time, _super);

    function Time() {
      this.setAnnotationEndafter = __bind(this.setAnnotationEndafter, this);

      this.setAnnotationInterval = __bind(this.setAnnotationInterval, this);

      this.setAnnotationRepeat = __bind(this.setAnnotationRepeat, this);

      this.setAnnotationEnd = __bind(this.setAnnotationEnd, this);

      this.setAnnotationStart = __bind(this.setAnnotationStart, this);

      this.updateFieldEndafter = __bind(this.updateFieldEndafter, this);

      this.updateFieldInterval = __bind(this.updateFieldInterval, this);

      this.updateFieldRepeat = __bind(this.updateFieldRepeat, this);

      this.updateFieldTo = __bind(this.updateFieldTo, this);

      this.updateFieldFrom = __bind(this.updateFieldFrom, this);
      return Time.__super__.constructor.apply(this, arguments);
    }

    Time.prototype.options = {
      parseTime: function(string) {
        var regex;
        if (string === null) {
          return false;
        }
        regex = /^([0]\d|[1][0-2])\/([0-2]\d|[3][0-1])\/([2][01]|[1][6-9])\d{2}(\s((([0]?[1-9]|1[0-2])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?( )?(AM|am|aM|Am|PM|pm|pM|Pm))|(([0]?[0-9]|1[0-9]|2[0-3])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?)))?$/;
        return regex.test(string);
      },
      stringifyTime: function(string) {
        return string;
      }
    };

    Time.prototype.field1 = null;

    Time.prototype.field2 = null;

    Time.prototype.field3 = null;

    Time.prototype.field4 = null;

    Time.prototype.field5 = null;

    Time.prototype.input1 = null;

    Time.prototype.input2 = null;

    Time.prototype.input3 = null;

    Time.prototype.input4 = null;

    Time.prototype.input5 = null;

    intRegex = /^\d+$/;

    Time.prototype.pluginInit = function() {
      if (!Annotator.supported()) {
        return;
      }
      this.field1 = this.annotator.editor.addField({
        type: 'datetime-local',
        label: Annotator._t('From'),
        load: this.updateFieldFrom,
        submit: this.setAnnotationStart
      });
      this.field2 = this.annotator.editor.addField({
        type: 'datetime-local',
        label: Annotator._t('To'),
        load: this.updateFieldTo,
        submit: this.setAnnotationEnd
      });
      this.field3 = this.annotator.editor.addField({
        type: 'input',
        label: 'Repeat every',
        load: this.updateFieldRepeat,
        submit: this.setAnnotationRepeat
      });
      this.field4 = this.annotator.editor.addField({
        type: 'select-interval',
        label: '',
        load: this.updateFieldInterval,
        submit: this.setAnnotationInterval
      });
      this.field5 = this.annotator.editor.addField({
        type: 'datetime-local',
        label: 'End on date',
        load: this.updateFieldEndafter,
        submit: this.setAnnotationEndafter
      });
      this.annotator.viewer.addField({
        load: this.updateViewer
      });
      this.input1 = $(this.field1).find(':input');
      this.input2 = $(this.field2).find(':input');
      this.input3 = $(this.field3).find(':input');
      this.input4 = $(this.field4).find(':input');
      return this.input5 = $(this.field5).find(':input');
    };

    Time.prototype.parseTime = function(string) {
      return this.options.parseTime(string);
    };

    Time.prototype.stringifyTime = function(string) {
      return this.options.stringifyTime(string);
    };

    Time.prototype.updateFieldFrom = function(field, annotation) {
      var value;
      value = annotation.start;
      return this.input1.val(value);
    };

    Time.prototype.updateFieldTo = function(field, annotation) {
      var value;
      value = annotation.end;
      return this.input2.val(value);
    };

    Time.prototype.updateFieldRepeat = function(field, annotation) {
      var value;
      value = annotation.rrepeat;
      return this.input3.val(value);
    };

    Time.prototype.updateFieldInterval = function(field, annotation) {
      var value;
      value = annotation.interval;
      return this.input4.val(value);
    };

    Time.prototype.updateFieldEndafter = function(field, annotation) {
      var value;
      value = annotation.end_after;
      return this.input5.val(value);
    };

    Time.prototype.setAnnotationStart = function(field, annotation) {
      return annotation.start = this.input1.val() || '';
    };

    Time.prototype.setAnnotationEnd = function(field, annotation) {
      annotation.end = this.input2.val() || '';
      if ((new Date(annotation.start)).getTime() > (new Date(annotation.end)).getTime()) {
        annotation.end = annotation.start;
      }
      if ((annotation.start === '') || (annotation.end === '')) {
        annotation.start = null;
        return annotation.end = null;
      }
    };

    Time.prototype.setAnnotationRepeat = function(field, annotation) {
      if (intRegex.test(this.input3.val())) {
        return annotation.rrepeat = this.input3.val();
      } else {
        annotation.rrepeat = '';
        this.input4.val('');
        return this.input5.val('');
      }
    };

    Time.prototype.setAnnotationInterval = function(field, annotation) {
      return annotation.rinterval = this.input4.val() || '';
    };

    Time.prototype.setAnnotationEndafter = function(field, annotation) {
      annotation.end_after = this.input5.val() || '';
      if ((new Date(annotation.end_after)).getTime() < (new Date(annotation.start)).getTime()) {
        annotation.end_after = annotation.end;
      }
      if ((annotation.rrepeat === '') || (annotation.rinterval === '') || (annotation.end_after === '')) {
        annotation.rrepeat = null;
        annotation.rinterval = null;
        return annotation.end_after = null;
      }
    };

    Time.prototype.updateViewer = function(field, annotation) {
      field = $(field);
      if (annotation.start) {
        if (annotation.rrepeat) {
          return field.addClass('annotator-datetime').html('<span class="annotator-datetime">From: ' + Annotator.$.escape(annotation.start) + '<br>' + 'To: ' + Annotator.$.escape(annotation.end) + '</span><br>' + '<span class="annotator-datetime"> Repeat every ' + annotation.rrepeat + ' ' + annotation.rinterval + '</span><br><span class="annotator-datetime">End on date: ' + Annotator.$.escape(annotation.end_after));
        } else {
          return field.addClass('annotator-datetime').html('<span class="annotator-datetime">From: ' + Annotator.$.escape(annotation.start) + '<br>' + 'To: ' + Annotator.$.escape(annotation.end) + '</span>');
        }
      } else {
        return field.remove();
      }
    };

    return Time;

  })(Annotator.Plugin);

}).call(this);
