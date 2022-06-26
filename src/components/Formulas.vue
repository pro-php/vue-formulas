<template>
    <v-container fluid>
        <v-app-bar
        app
        >
            <v-spacer />
            <v-btn
                outlined
                class="ml-2"
                @click="initialize"
            >
                Отмена
            </v-btn>

            <v-btn 
                color="primary"
                class="ml-2"
                @click="saveForm"
            >
                Сохранить
            </v-btn>
        </v-app-bar>

        <v-data-table
        :headers="headers"
        :items="desserts"
        class="elevation-1 mt-15"
        hide-default-footer
        >
            <template v-slot:top>
                <v-toolbar
                flat
                >
                    <v-toolbar-title>Настройка формул</v-toolbar-title>
                    <v-divider
                        class="mx-4"
                        inset
                        vertical
                    ></v-divider>
                    <v-spacer></v-spacer>

                    <v-dialog
                        v-model="dialog"
                        fullscreen
                        hide-overlay
                        transition="dialog-bottom-transition"
                    >
                        <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            color="primary"
                            dark
                            v-bind="attrs"
                            v-on="on"
                        >
                            Добавить формулу
                        </v-btn>
                        </template>
                        <v-card>
                            <v-toolbar
                                dark
                                color="primary"
                            >
                                <v-btn
                                icon
                                dark
                                @click="close"
                                >
                                     <v-icon>mdi-close</v-icon>
                                </v-btn>
                                <v-toolbar-title>Задать формулу</v-toolbar-title>
                                <v-spacer></v-spacer>
                                <v-toolbar-items>
                                    <v-btn
                                        outlined
                                        text
                                        @click="close"
                                    >
                                        Отменить
                                    </v-btn>
                                    <v-btn
                                        dark
                                        text
                                        @click="saveFormula"
                                        :disabled="!isValidFormula"
                                    >
                                        Сохранить
                                    </v-btn>
                                </v-toolbar-items>
                            </v-toolbar>

                            <v-container fluid fill-height pa-0>
                                <v-row no-gutters class="mt-2">
                                    <v-col
                                    cols="12"
                                    sm="2"
                                    >
                                        <v-card style="height: 85vh"
                                            class="pa-6 pt-2 text-center"
                                            outlined
                                            tile
                                        >
                                           <div v-for="(inputSign, index) in filterSigns()" :key="index">
                                                <v-btn
                                                    block
                                                    outlined
                                                    class="mt-1"
                                                    draggable="true"
                                                    @dragstart="onDragStart($event, inputSign)"
                                                >
                                                    {{ titleSign(inputSign) }}
                                                </v-btn>
                                                <v-spacer />
                                            </div>
                                        </v-card>
                                    </v-col>

                                    <v-col
                                    cols="12"
                                    sm="9"
                                    >
                                        <v-card style="height: 85vh;"
                                            class="pa-2 d-flex flex-wrap"
                                            :style="!isValidFormula ? 'border: 1px solid red;' : ''"
                                            outlined
                                            tile
                                            @dragover.prevent
                                            @dragenter.prevent
                                            @drop="onDrop($event)"
                                        >


                                            <v-text-field
                                                v-for="(input, index) in inputsForumla"
                                                :key="index"
                                                outlined
                                                clearable
                                                v-model.number="input.value"
                                                :style="{maxWidth: (input.readonly ? 60 : 80) + 'px'}"
                                                :readonly="input.readonly"
                                                @click:clear="deleteInput(index)"
                                                @keypress="isNumber($event)"
                                            ></v-text-field>

                                        </v-card>
                                    </v-col>

                                    <v-col
                                    cols="12"
                                    sm="1"
                                    >
                                        <v-card style="height: 85vh"
                                            class="pa-2 text-center"
                                            outlined
                                            tile
                                        >
                                            <div v-for="(inputSign, index) in filterSigns('right')" :key="index">
                                                <v-btn
                                                    outlined
                                                    class="mt-1"
                                                    draggable="true"
                                                    @dragstart="onDragStart($event, inputSign)"
                                                >
                                                    {{ inputSign.value }}
                                                </v-btn>
                                                <v-spacer />
                                            </div>
                                        </v-card>
                                    </v-col>

 
                                </v-row>
                            </v-container>
                        </v-card>
                    </v-dialog>
                </v-toolbar>
            </template>

            <template v-slot:[`item.actions`]="{ item }">
                <v-icon
                small
                class="mr-2"
                @click="editItem(item)"
                >
                mdi-pencil
                </v-icon>
                <v-icon
                small
                @click="deleteItem(item)"
                >
                mdi-delete
                </v-icon>
            </template>
        </v-data-table>


        <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
            <v-card-title class="text-h5">Удалить формулу</v-card-title>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">Нет</v-btn>
                <v-btn color="blue darken-1" text @click="deleteItemConfirm">Да</v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>>

<script>
export default {
    name: 'MainTable',

  data: () => ({
    dialog: false,
    dialogDelete: false,
    headers: [
      {
        text: 'Формула',
        align: 'start',
        sortable: false,
        value: 'value',
        width: '80%'
      },
      {
        text: 'Действие',
        sortable: false,
        value: 'actions',
        width: '20%'
      },
    ],
    desserts: [],
    editedIndex: -1,
    inputsForumla: [],
    inputsChars: [
        {
            value: 0,
            readonly: false,
            position: 'left',
            title: 'Число',
            type: 'number',
        },
        {
            value: 'x',
            readonly: true,
            position: 'left',
            title: '',
            type: 'var',
        },
        {
            value: 'y',
            readonly: true,
            position: 'left',
            title: '',
            type: 'var',
        },
        {
            value: 'z',
            readonly: true,
            position: 'left',
            title: '',
            type: 'var',
        },

        {
            value: '+',
            readonly: true,
            position: 'right',
            title: '',
            type: 'sign',
        },
        {
            value: '-',
            readonly: true,
            position: 'right',
            title: '',
            type: 'sign',
        },
        {
            value: '*',
            readonly: true,
            position: 'right',
            title: '',
            type: 'sign',
        },
        {
            value: '/',
            readonly: true,
            position: 'right',
            title: '',
            type: 'sign',
        },
        {
            value: '(',
            readonly: true,
            position: 'right',
            title: '',
            type: 'bracket_left',
        },
        {
            value: ')',
            readonly: true,
            position: 'right',
            title: '',
            type: 'bracket_right',
        },
    ],
  }),

  computed: {
    isValidFormula() {
        let bracketLeft = false;
        let prevType = '';
        let isValid = true;
        const noDoubleChars = ['number','var'];

        for (const v of this.inputsForumla) {

            if (noDoubleChars.includes(v.type)) {
                if (noDoubleChars.includes(prevType) || prevType=='bracket_right') {
                    isValid = false; break;
                }
            }

            if (v.type=='sign' && prevType == 'sign') {
                isValid = false; break;
            }

            if (v.type=='bracket_left') {
                bracketLeft = true;

                if (noDoubleChars.includes(prevType)) {
                    isValid = false; break;
                }
            }

            if (v.type=='bracket_right') {
                if (bracketLeft) {
                    bracketLeft = false;
                }
                else {
                    isValid = false; break;
                }
            }

            prevType =  v.type;
        }

        if (bracketLeft) {
            isValid = false;
        }

        if (this.inputsForumla.length && this.inputsForumla[0].type=='sign') {
            isValid = false;
        }

        return isValid;
    }
  },

  watch: {
        dialog (val) {
            val || this.close()
        },
        dialogDelete (val) {
            val || this.closeDelete()
        },
  },
  created () {
        this.loadForm();
  },
  methods: {
    initialize () {
        //init default formulas
        this.desserts = [
            {
                value: '(x+y)*5',
                formula: []
            },
            {
                value: 'z-y+8',
                formula: []
            },
        ]

        this.desserts.forEach((v) => {
            v.formula = this.stringToFormula(v.value.split(""));
        });
    },
    saveForm() {
        localStorage.setItem('form', JSON.stringify(this.desserts));
    },
    loadForm() {
        const form = JSON.parse(localStorage.getItem('form'));
        if (form) {
            this.desserts = form;
        }
        else {
            this.initialize();
        }
    },
    filterSigns(position='left') {
        return this.inputsChars.filter((input) => input.position === position)
    },
    titleSign(char) {
        return char.title !=='' ? char.title : char.value;
    },
    getTypeSign(value) {
        let input = this.inputsChars.filter((input) =>  input.value === value)
        if (input.length) {
            return input[0].type;
        }

        return 'number';
    },
    isNumber(evt) {
        evt = (evt) ? evt : window.event;
        const charCode = (evt.which) ? evt.which : evt.keyCode;
        if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
            evt.preventDefault();
        } else {
            return true;
        }
    },
    onDrop(event) {
        let item = JSON.parse(event.dataTransfer.getData('item'));
        this.inputsForumla.push(item)
    },
    onDragStart(event, item) {
        event.dataTransfer.dropEffect = 'copy';
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('item', JSON.stringify(item));
    },
    deleteInput(index) {
        setTimeout(() => {
            this.inputsForumla.splice(index, this.inputsForumla.length);
        }, 250);
    },
    stringToFormula(str) {
        return str.map((char) => {
            return {
                value: char,
                readonly: parseInt(char)==='NaN' ? true : false,
                type: this.getTypeSign(char)
            }
        });
    },
    formulaToString() {
        if (!this.inputsForumla.length) {
            return '';
        }

        return this.inputsForumla.reduce((value, v) => {
                    return value + v.value;
                }, '');
    },
    editItem (item) {
        this.editedIndex = this.desserts.indexOf(item)
        this.inputsForumla = Array.from(item.formula);
        this.dialog = true;
    },
    saveFormula() {
        const newFormula = {
            value: this.formulaToString(),
            formula: this.inputsForumla
        }

        if (this.editedIndex > -1) {
            Object.assign(this.desserts[this.editedIndex], newFormula)
        } else {
            this.desserts.push(newFormula)
        }

        this.close();
    },
    deleteItem(item) {
        this.editedIndex = this.desserts.indexOf(item);
        this.dialogDelete = true;
    },
    deleteItemConfirm() {
        this.desserts.splice(this.editedIndex, 1);
        this.closeDelete();
    },
    closeDelete() {
        this.dialogDelete = false;
        this.$nextTick(() => {
            this.editedIndex = -1;
        })
    },
    close() {
        this.editedIndex = -1;
        this.inputsForumla = [];
        this.dialog = false;
    },

  },
}
</script>

<style scoped>
    .not_valid_form {
         border: 1px solid red;
    }
</style>
