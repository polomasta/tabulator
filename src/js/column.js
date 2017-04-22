var Column = function(def, parent){

	var col = {
		table:parent.table,
		definition:def, //column definition
		parent:parent, //hold parent object
		columns:[], //child columns
		cells:[], //cells bound to this column
		element:$("<div class='tabulator-col' role='columnheader' aria-sort='none'></div>"), //column header element
		groupElement:false, //column group holder element

		extensions:{}, //hold extension variables;

		width:null, //column width,
		minWidth:null, //column minimum width,

		visible:true, //default visible state

		//////////////// Setup Functions /////////////////

		//register column position with column manager
		registerColumnPosition:function(col){
			parent.registerColumnPosition(col);
		},

		//build header element
		_buildHeader:function(){
			var self = this;

			self.element.empty();

			if(self.columns.length){
				self._buildGroupHeader();
			}else{
				self._buildColumnHeader();
			}
		},

		//build header element for header
		_buildColumnHeader:function(){
			var self = this,
			def = self.definition,
			table = self.table,
			sortable;

			var content = self._buildColumnHeaderContent()

			self.element.append(content);

			//set column sorter
			if(table.extExists("sort") && typeof def.sorter != "undefined"){
				table.extensions.sort.initializeColumn(self, content);
			}

			//set column formatter
			if(table.extExists("format")){
				table.extensions.format.initializeColumn(self);
			}

			//set column visibility
			if(typeof def.visible != "undefined"){
				if(def.visible){
					self.show();
				}else{
					self.hide();
				}
			}

			//asign additional css classes to column header
			if(def.cssClass){
				self.element.appendClass(def.cssClass);
			}

			//set min width if present
			self.setMinWidth(typeof def.minWidth == "undefined" ? self.table.options.colMinWidth : def.minWidth);

			//set width if present
			self.setWidth(def.width);

		},

		_buildColumnHeaderContent:function(){
			var self = this,
			def = self.definition,
			table = self.table;

			var contentElement = $("<div class='tabulator-col-content'></div>");

			contentElement.append(self._buildColumnHeaderTitle());

			return contentElement;
		},

		//build title element of column
		_buildColumnHeaderTitle:function(){
			var self = this,
			def = self.definition,
			table = self.table,
			title;

			var titleHolderElement = $("<div class='tabulator-col-title'></div>");

			// if(table.extExists("localize")){
			// 	title = table.extensions.localize.lang.columns[def.field] || (def.title ? def.title : "&nbsp");
			// }else{
				title = def.title ? def.title : "&nbsp";
			//}


			if(def.editableTitle){
				var titleElement = $("<input class='tabulator-title-editor'>");
				titleElement.val(title);

				titleElement.on("click", function(e){
					e.stopPropagation();
					$(this).focus();
				});

				titleElement.on("change", function(){
					var newTitle = $(this).val();
					def.title = newTitle;
					// table.options.colTitleChanged(newTitle, column, options.columns);
				});

				title = titleElement;
			}

			if(typeof title == "string"){
				titleHolderElement.html(title);
			}else{
				titleHolderElement.append(title);
			}

			return titleHolderElement;
		},

		//build header element for column group
		_buildGroupHeader:function(){
			var self = this,
			table = self.table;
		},


		//// Retreive Column Information ////

		//return column header element
		getElement:function(){
			return this.element;
		},

		//return colunm group element
		getGroupElement:function(){
			return this.groupElement;
		},

		//////////////////// Actions ////////////////////

		//show column
		show:function(){
			this.visible = true;

			this.element.show();
		},

		//hide column
		hide:function(){
			this.visible = false;

			this.element.hide();
		},

		setWidth:function(width){
			this.width = width;

			this.element.css("width", width || "");

			this.cells.forEach(function(cell){
				cell.setWidth(width);
			});
		},

		setMinWidth:function(minWidth){
			this.minWidth = minWidth;

			this.element.css("min-width", minWidth || "");

			this.cells.forEach(function(cell){
				cell.setMinWidth(minWidth);
			});
		},

		//////////////// Cell Management /////////////////

		//generate cell for this column
		generateCell:function(row){
			var self = this;

			var cell = new Cell(self, row);

			this.cells.push(cell);

			return cell;
		},

		//set column width to maximum cell width
		fitToData:function(){
			var self = this;

			var maxWidth = 0;

			if(!self.width){
				self.cells.forEach(function(cell){
					var width = cell.getWidth();

					if(width > maxWidth){
						maxWidth = width;
					}
				});

				console.log("column", maxWidth)

				if(maxWidth){
					self.setWidth(maxWidth);
				}

			}
		},
	};

	//initialize column
	if(def.columns){
		def.columns.forEach(function(def, i){
			var newCol = new Column(def, col);

			col.columns.push(newCol);
		});
	}else{
		parent.registerColumnPosition(col);
	}

	col._buildHeader();

	if(col.visible){
		col.parent.element.append(col.element);
	}

	return col;
}