/**
	@base Panagora.Class
	@constructor
*/

Panagora.Widgets.TimeToShipping = new (Panagora.Class.create(

function TimeToShipping($) {

	/* Private variables
	*********************/
	var self = this,
		element,
		content,
		pieChart;

	function init() {

		/* Initialization on DOM ready
		*******************************/
		Panagora.Widgets.add('C1771978-EA40-D742-A04C-A17ACCACB19E', {
			title: 'Time to shipping',
			init: onPanelInit
		});
	}

	/* Event handlers
	******************/
	function onPanelInit(e, obj) {
		element = obj.element;
		content = obj.content;

		var defaultDays = 7;

		$.each([7,14,30,90,365], function (i, v) {
			var b = $('<button></button>')
				.appendTo(content)
				.text(v)
				.click(onDaysClick);
			if (v == defaultDays)
				b.css({	'fontWeight':'bold' });
		});

		pieChart = $('<div></div>')
			.appendTo(content)
			.css({
					width: '200px',
					height: '200px',
					marginTop: '15px',
					marginLeft: 'auto',
					marginRight: 'auto'
				});

		getData(defaultDays);
	}

	function onDaysClick() {
		$(this).css({ fontWeight: 'bold' })
			.siblings('button')
				.css({ fontWeight: 'normal' });
		getData($(this).text());
	}

	/* Ajax handlers
	****************/
	function onStatsReceived(json) {
		var daysArray = [],
			dataObjArray = [],
			res = json.Response,
			l = res.length, i,
			numDays, preStr, resStr, data;

		for (i = 0; i < 8; i++) {
			daysArray[i] = 0;
		}

		for(i = 0; i < l; i++) {
			numDays = Math.floor(res[i].HoursToShipping / 24);
			daysArray[numDays < 7 ? numDays : 7]++;
		}

		for (i = 0; i < 8; i++) {
			preStr = (i + 1 < 8 ? i + ' - ' + (i + 1) : '> ' + i) + ' days ';
			resStr = (l > 0 ? Math.round(100 * daysArray[i] / l) : 0)  + ' %';
			label = preStr;// + resStr;
			data = l > 0 ? daysArray[i] / l : 0;
			dataObjArray.push({ label: label, data: data })
		}

		if (l < 1) {
			$.extend(dataObjArray[0], { color: '#FFF' });
			dataObjArray[0].data = 1;
		}

		plot = $.plot(pieChart, dataObjArray, { series: { pie: { show: true, stroke: {width: 0} } },
			legend: {
				show: $('.hookTable').length === 0,
            	backgroundOpacity: 0
        	},
        	grid: {
            	hoverable: true,
            	clickable: true
        	}
        });

		element.panel('endLoading');

		if ($('.hookTable').length > 0)
			return;

		var table = $(content).find('table');//.clone();

		var num = $(table).find('tr').length / 2,
			divContent = $('<div></div>'),
			info = $('<p>Hover to a get value</p>')
					.css({
						marginTop: '20px',
						width: '100%',
						textAlign: 'center'
					}),
			leftTable = $('<table class="hookTable"></table>')
					.css({
						margin: '20px',
						marginRight: '0px',
						fontSize: '10px',
						color: '#444',
						textAlign: 'right',
						float: 'left'
					}),
			rightTable = leftTable
					.clone()
					.css({
						marginRight: '20px',
						float: 'right'
					});

		console.log($(table).find('tr'));
		$(table).find('tr').each(function(index, value) {
			var innerDiv = $(this).find('div')[1];
				outerDiv = $(innerDiv);

			if (index < num) {
				$(leftTable).append($(this));
			} else {
				$(rightTable).append($(this));
			}

			$($(this).find('div')[0]).removeAttr( 'style' );
			$($(this).find('div')[1]).css('borderWidth', '8px');
			$($(this).find('div')[1]).attr('class','labelcolor').css('margin-right', '8px');
		});

		var div =
			$(divContent)
				.append(leftTable)
				.append(rightTable);

		$(content)
			.append(info)
			.append(div);

        $(pieChart).bind("plothover", function(event, pos, obj) {

        	if (!obj) {
        		var percent = 'Hover to get value';
				$(info).text(percent);
				return;
        	}

			var percent = parseFloat(obj.series.percent).toFixed(2);
			var label = $(content).find('.legendLabel').eq(obj.seriesIndex).text();

			$(info).text( label + percent + ' %');

			var rgba = obj.series.color.replace('rgb','rgba').replace(')',',0.5)');

			$(content).find('.labelcolor').each(function(){
				var col = $(this).css('border-left-color');
				if (col.indexOf('rgba') > -1)
					$(this).css('border-color', col.slice(0, col.lastIndexOf(',')) + ',1)');
			});

			$(content).find('.labelcolor').eq(obj.seriesIndex).css('border-color',rgba);
		});

		$(pieChart).bind("plotclick", function(event, pos, obj) {
			var rgba = obj.series.color.replace('rgb','rgba').replace(')',',0.5)');
			$(content).find('.labelcolor').each(function(){
				var col = $(this).css('border-left-color');
				if (col.indexOf('rgba') > -1)
					$(this).css('border-color', col.slice(0, col.lastIndexOf(',')) + ',1)');
			});
			$(content).find('.labelcolor').eq(obj.seriesIndex).css('border-color',rgba);
		});

		$(table).remove();
	}


	/* Private methods
	*******************/

	function getRGBwithAlpha(alpha) {
		var getVal = function(val) {
			return alpha * val + (1 - alpha) * old;
		}


	}

	function getRGBwithOutAlpha(alpha) {

	}

	function getAction(name) {
		return '/plugins/TimeToShippingWidget_' + name;
	}

	function getData(days) {
		element.panel('beginLoading');
		Panagora.post({
			url: getAction('getStats'),
			data: { days: days*10 },
			success: onStatsReceived
		});
	}

	Panagora.ready(init);

}))(jQuery);