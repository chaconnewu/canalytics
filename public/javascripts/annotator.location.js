/*
** Annotator 1.2.5-dev-b83d51d
** https://github.com/okfn/annotator/
**
** Copyright 2012 Aron Carroll, Rufus Pollock, and Nick Stenning.
** Dual licensed under the MIT and GPLv3 licenses.
** https://github.com/okfn/annotator/blob/master/LICENSE
**
** Built at: 2013-07-24 19:10:55Z
*/


(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Annotator.Plugin.Location = (function(_super) {

    __extends(Location, _super);

    function Location() {
      this.setAnnotationLocation = __bind(this.setAnnotationLocation, this);

      this.updateField = __bind(this.updateField, this);
      return Location.__super__.constructor.apply(this, arguments);
    }

    Location.prototype.options = {
      parseLocation: function(string) {
        var location;
        string = $.trim(string);
        if (string) {
          location = string;
        }
        return location;
      },
      stringifyLocation: function(string) {
        return string;
      }
    };

    Location.prototype.field = null;

    Location.prototype.input = null;

    Location.prototype.pluginInit = function() {
      if (!Annotator.supported()) {
        return;
      }
      this.field = this.annotator.editor.addField({
        type: 'select-location',
        label: Annotator._t('Location'),
        load: this.updateField,
        submit: this.setAnnotationLocation,
        search: this.searchLocation.bind(this)
      });
      this.annotator.viewer.addField({
        load: this.updateViewer
      });
      return this.input = $(this.field).find('select');
    };

    Location.prototype.parseLocation = function(string) {
      return this.options.parseLocation(string);
    };

    Location.prototype.stringifyLocation = function(string) {
      return this.options.stringifyLocation(string);
    };

    Location.prototype.ajax_request = function(url, method, data, success) {
      data = data || {};
      success = success || function() {};
      return $.ajax({
        url: url,
        type: method,
        async: false,
        data: data,
        success: success,
        error: function() {
          return console.log($.makeArray(arguments));
        }
      });
    };

    Location.prototype.searchLocation = function(loc, el, callback) {
      var that;
      that = this;
      if (window.top.calocation.location_list.indexOf(loc) > -1) {
        return callback(null);
      } else {
        return window.top.geocoder.geocode({
          'address': loc
        }, function(results, status) {
          var addrs, radio_btns, result, _i, _len;
          if (status === google.maps.GeocoderStatus.OK) {
            radio_btns = '';
            addrs = {};
            for (_i = 0, _len = results.length; _i < _len; _i++) {
              result = results[_i];
              radio_btns += "<input type='radio' name='loc' value='" + result["formatted_address"] + "'>" + result["formatted_address"] + "<br>";
              addrs[result["formatted_address"]] = result["geometry"]["location"];
            }
            $(el).append("<div id='location_alert'><form id='locform' name='locform'><b>Which location do you mean?</b><br>" + radio_btns + "</form></div>");
            return $("#location_alert").dialog({
              width: 'auto',
              modal: true,
              buttons: {
                'None of the above': function() {
                  $(this).dialog("close");
                  return callback(null);
                },
                'Done': function() {
                  var loc_selected, params;
                  loc_selected = $('input:radio[name=loc]:checked').val();
                  $(this).dialog("close");
                  if (typeof camap !== "undefined" && camap !== null) {
                    new google.maps.Marker({
                      map: camap.map,
                      position: addrs[loc_selected],
                      title: loc_selected
                    });
                  }
                  params = "location=" + encodeURIComponent(loc_selected) + "&lat=" + addrs[loc_selected].lat() + "&lng=" + addrs[loc_selected].lng() + "&mid=" + window.top.mid;
                  return that.ajax_request('/maps/location', 'POST', params, callback(loc_selected));
                }
              },
              close: function(ev, ui) {
                $(this).dialog("destroy");
                return $(this).remove();
              }
            });
          } else {
            $(el).append("<div id='location_alert'>We could not find the location <b>" + loc + "</b>. Make sure all street and city names are spelled correctly.</div>");
            return callback(null);
          }
        });
      }
    };

    Location.prototype.updateField = function(field, annotation) {
      $(field).find('select option').each(function() {
        if ($(this).val() === annotation.location) {
          return $(this).attr('selected', 'selected');
        }
      });
      return $('.field-location').trigger('liszt:updated');
    };

    Location.prototype.setAnnotationLocation = function(field, annotation) {
      if ((this.input.val() != null) && this.input.val() !== '') {
        return annotation.location = this.input.val();
      }
    };

    Location.prototype.updateViewer = function(field, annotation) {
      field = $(field);
      if (annotation.location && annotation.location !== "") {
        return field.addClass('annotator-location').html('<span class="annotator-location">' + Annotator.$.escape(annotation.location) + '</a></span>');
      } else {
        return field.remove();
      }
    };

    return Location;

  })(Annotator.Plugin);

}).call(this);
