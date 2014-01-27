/*
** Annotator 1.2.5-dev-b83d51d
** https://github.com/okfn/annotator/
**
** Copyright 2012 Aron Carroll, Rufus Pollock, and Nick Stenning.
** Dual licensed under the MIT and GPLv3 licenses.
** https://github.com/okfn/annotator/blob/master/LICENSE
**
** Built at: 2014-01-24 16:06:46Z
*/


(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Annotator.Plugin.People = (function(_super) {

    __extends(People, _super);

    function People() {
      this.setAnnotationRelation = __bind(this.setAnnotationRelation, this);

      this.setAnnotationPeople = __bind(this.setAnnotationPeople, this);

      this.updateField2 = __bind(this.updateField2, this);

      this.updateField1 = __bind(this.updateField1, this);
      return People.__super__.constructor.apply(this, arguments);
    }

    People.prototype.options = {
      parsePeople: function(string) {
        var people;
        string = $.trim(string);
        people = [];
        if (string) {
          people = string.split(',');
        }
        return people;
      },
      stringifyPeople: function(array) {
        return array.join(",");
      }
    };

    People.prototype.field1 = null;

    People.prototype.field2 = null;

    People.prototype.input1 = null;

    People.prototype.input2 = null;

    People.prototype.pluginInit = function() {
      if (!Annotator.supported()) {
        return;
      }
      this.field1 = this.annotator.editor.addField({
        type: 'select-people',
        label: 'People...',
        load: this.updateField1,
        submit: this.setAnnotationPeople
      });
      this.field2 = this.annotator.editor.addField({
        type: 'select-relation',
        label: 'Relation...',
        load: this.updateField2,
        submit: this.setAnnotationRelation
      });
      this.annotator.viewer.addField({
        load: this.updateViewer
      });
      this.input1 = $(this.field1).find('select');
      return this.input2 = $(this.field2).find('select');
    };

    People.prototype.parsePeople = function(string) {
      return this.options.parsePeople(string);
    };

    People.prototype.stringifyPeople = function(array) {
      return this.options.stringifyPeople(array);
    };

    People.prototype.updateField1 = function(field, annotation) {
      var people_list;
      people_list = [];
      if (annotation.people != null) {
        people_list = annotation.people;
      }
      return $(field).find('select option').each(function() {
        $(this).prop('selected', false);
        if (people_list.indexOf($(this).val()) > -1) {
          return $(this).prop('selected', true);
        }
      });
    };

    People.prototype.updateField2 = function(field, annotation) {
      return $(field).find('select option').each(function() {
        $(this).prop('selected', false);
        if ($(this).val() === annotation.relation) {
          return $(this).attr('selected', 'selected');
        }
      });
    };

    People.prototype.setAnnotationPeople = function(field, annotation) {
      if (this.input1.val() && this.input1.val().length > 0) {
        return annotation.people = this.input1.val();
      }
    };

    People.prototype.setAnnotationRelation = function(field, annotation) {
      if (annotation.people) {
        if (annotation.people.length === 1) {
          if (this.input2.val()) {
            return annotation.relation = this.input2.val();
          } else {
            return annotation.relation = 'self';
          }
        } else {
          if (this.input2.val()) {
            return annotation.relation = this.input2.val();
          } else {
            return annotation.relation = 'related';
          }
        }
      }
    };

    People.prototype.updateViewer = function(field, annotation) {
      field = $(field);
      if (annotation.people && $.isArray(annotation.people) && annotation.people.length) {
        return field.addClass('annotator-people').html(function() {
          var string;
          string = $.map(annotation.people, function(person) {
            return '<span class="annotator-person">' + Annotator.$.escape(person) + '</span>';
          }).join(' ');
          return string = string + '<br>' + annotation.relation;
        });
      } else {
        return field.remove();
      }
    };

    return People;

  })(Annotator.Plugin);

}).call(this);
