const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const MAX_DAY_REQUEST = 23;

const CURRENT_MONTH_ERROR_MESSAGE = 'Não é possível solicitar férias para ${REQUEST_MONTH}. Efetuar nova solicitação para um mês posterior à ${REQUEST_MONTH}';

const MAX_DAY_REQUEST_ERROR_MESSAGE = 'Não é possível solicitar férias para ${REQUEST_MONTH} pois a data atual é superior ao dia ' + MAX_DAY_REQUEST + '. Efetuar nova solicitação para um mês posterior à ${REQUEST_MONTH}';

const THURSDAY_ERROR_MESSAGE = 'Não é possível solicitar férias em uma quinta-feira. Efetuar nova solicitação para outro dia.';

const BONUSDAY_ERROR_MESSAGE = 'A solicitação de abono só pode ser feita no primeiro fracionamento do período de férias!';


exports.handler = async (event) => {

    let request;   
    if(event.body === undefined) {
      request = event;
    } else {
        request = JSON.parse(event.body);
    }

    // Executa a validação customizada para cada solicitação de férias
    request.input.vacationSchedules.forEach(schedule => validate(request.output, schedule));

    const response = {
        statusCode: 200,
        body: JSON.stringify(request.output),
    };
    return response;
};

/**

* Executa as validações customizadas sobre a solicitação de férias

*

* @param output Mensagens de erro

* @param vacationSchedule Programação de férias

* @returns Mensagens de erro, as informações da solicitação de férias

*/

const validate = async (output, vacationSchedule) => {

    const currentDate = new Date();

    const startDate = new Date(vacationSchedule.startDate);

 

    // Remove a mensagem de erro referente a quantidade de dias de antecedência

    removeValidationMessage(output, vacationSchedule, 'TYPE_1_VACATION_SCHEDULING_IN_ADVANCE');

 

    // Valida se o mês e ano de início das férias é igual ao mês atual

    if (startDate.getUTCMonth() === currentDate.getUTCMonth()

     && startDate.getFullYear() === currentDate.getFullYear()) {

        let currentMonthName = MONTH_NAMES[startDate.getUTCMonth()];

        let message = replace(CURRENT_MONTH_ERROR_MESSAGE, '${REQUEST_MONTH}', currentMonthName);

        addValidationMessage(output, vacationSchedule, message);

    } else {

        // Valida se a data atual é maior que o dia limite de solicitação das férias e se o mês de início das férias é o próximo mês, considerando janeiro do ano seguinte

        if (currentDate.getUTCDate() > MAX_DAY_REQUEST &&

           ( ((currentDate.getUTCMonth() + 1) === startDate.getUTCMonth() && startDate.getYear() === currentDate.getYear()) ||

           ( (startDate.getYear() === (currentDate.getYear() + 1)) && ((startDate.getUTCMonth()) === 0)) && (currentDate.getUTCMonth()) === 11)) {

            let currentMonthName = MONTH_NAMES[startDate.getUTCMonth()];

            let message = replace(MAX_DAY_REQUEST_ERROR_MESSAGE, '${REQUEST_MONTH}', currentMonthName);

            addValidationMessage(output, vacationSchedule, message);

        }

    }

   

    // VALIDA SE É UMA QUINTA FEIRA

    if (startDate.getDay() == 4) {

        addValidationMessage(output, vacationSchedule, THURSDAY_ERROR_MESSAGE);

    }

   



/**

* Adiciona uma mensagem customizada a uma validação de férias

*

* @param output Mensagens de erro

* @param vacationSchedule Solicitação de férias

* @param message Mensagem que será dicionada

*/

const addValidationMessage = (output, vacationSchedule, message) => {

    if (output.vacationScheduleMessages == null) {

        output.vacationScheduleMessages = [];

    }

 

    let vacationScheduleMessages = output.vacationScheduleMessages.find(vacationScheduleMessages => vacationScheduleMessages.employeeId === vacationSchedule.employeeId);

    if (vacationScheduleMessages != null) {

        addMessage(vacationScheduleMessages, message);

    } else {

        let vacationScheduleMessages = {

            employeeId: vacationSchedule.employeeId,

            vacationPeriodId: vacationSchedule.vacationPeriodId,

            startDate: vacationSchedule.startDate

        };

        addMessage(vacationScheduleMessages, message);

        output.vacationScheduleMessages.push(vacationScheduleMessages);

    }

};

 

/**

* Cria uma mensagem de validação

*

* @param vacationScheduleMessages Mensagens de erro

* @param message Mensagem

*/

const addMessage = (vacationScheduleMessages, message) => {

    if (vacationScheduleMessages.validationMessages == null) {

        vacationScheduleMessages.validationMessages = [];

    }

 

    vacationScheduleMessages.validationMessages.push({

        message: message

    });

};

 

/**

* Remove uma mensagem de validação da lista de mensagens existentes

*

*  @param output Mensagens de erro

*  @param vacationSchedule Solicitação de férias

*  @param validationMessageType Tipo de mensagem de validação

*/

const removeValidationMessage = (output, vacationSchedule, validationMessageType) => {

    if (output != null && output.vacationScheduleMessages != null && output.vacationScheduleMessages.length > 0) {

        let vacationScheduleMessages = output.vacationScheduleMessages.find(vacationScheduleMessages => vacationScheduleMessages.employeeId === vacationSchedule.employeeId);

        if (vacationScheduleMessages != null && vacationScheduleMessages.validationMessages != null && vacationScheduleMessages.validationMessages.length > 0) {

            vacationScheduleMessages.validationMessages = vacationScheduleMessages.validationMessages.filter(validationMessage => validationMessageType !== validationMessage.type);

        }

    }

};

 

const replace = (message, key, value) => {

    while (message.indexOf(key) >= 0) {

        message = message.replace(key, value);

    }

    return message;

};

 

/**
 * Nome da primitiva : validateVacationSchedule
 * Nome do dominio : hcm
 * Nome do serviço : vacationmanagement
 * Nome do tenant : trn06312940
 **/
/*const ERROR_MESSAGE_MONTH_YEAR = 'Não é permitido inserir programação de férias no mesmo mês/ano que o mês/ano atual!';

exports.handler = async (event) => {
  let request;

  if (event.body === undefined) {
    request = event;
  }
  else {
    request = parseBody(event);
  }

  let vacations = request.vacations;
  for (let vacationsMan of vacations) {
    const currentDate = new Date();
    const startDate = new Date(vacationsMan.startDate);

    // Valida se o mês e ano de início das férias é igual ao mês atual
    if (startDate.getUTCMonth() === currentDate.getUTCMonth() && startDate.getFullYear() === currentDate.getFullYear()) {
      //return sendRes(400, 'Não é permitido inserir programação de férias no mesmo mês/ano que o mês/ano atual!');
      addValidationMessage(request.output, vacationsMan, ERROR_MESSAGE_MONTH_YEAR);
    }
  }

  // Executa a validação customizada para cada solicitação de férias
  //request.vacations.forEach(schedule => validate(schedule));


  return sendRes(200, JSON.parse(event.body));
};


*/

/*

const parseBody = (event) => {
  return typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
};

const sendRes = (status, body) => {
  var response = {
    statusCode: status,
    headers: {
      "Content-Type": "application/json"
    },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  };
  return response;
};

const addMessage = (vacationScheduleMessages, message) => {
  if (vacationScheduleMessages.validationMessages == null) {
    vacationScheduleMessages.validationMessages = [];
  }
  vacationScheduleMessages.validationMessages.push({
    message: message
  });
};

const addValidationMessage = (output, vacationSchedule, message) => {
  if (output.vacationScheduleMessages == null) {
    output.vacationScheduleMessages = [];
  }


  let vacationScheduleMessages = output.vacationScheduleMessages.find(vacationScheduleMessages => vacationScheduleMessages.employeeId === vacationSchedule.employeeId);
  if (vacationScheduleMessages != null) {
    addMessage(vacationScheduleMessages, message);
  }
  else {
    let vacationScheduleMessages = {
      employeeId: vacationSchedule.employeeId,
      vacationPeriodId: vacationSchedule.vacationPeriodId,
      startDate: vacationSchedule.startDate
    };
    addMessage(vacationScheduleMessages, message);
    output.vacationScheduleMessages.push(vacationScheduleMessages);
  }
};

/*

const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MAX_DAY_REQUEST = 23;
const CURRENT_MONTH_ERROR_MESSAGE = 'Não é possível solicitar férias para ${REQUEST_MONTH}. Efetuar nova solicitação para um mês posterior à ${REQUEST_MONTH}';
const MAX_DAY_REQUEST_ERROR_MESSAGE = 'Não é possível solicitar férias para ${REQUEST_MONTH} pois a data atual é superior ao dia ' + MAX_DAY_REQUEST + '. Efetuar nova solicitação para um mês posterior à ${REQUEST_MONTH}';
const THURSDAY_ERROR_MESSAGE = 'Não é possível solicitar férias em uma quinta-feira. Efetuar nova solicitação para outro dia.';
const BONUSDAY_ERROR_MESSAGE = 'A solicitação de abono só pode ser feita no primeiro fracionamento do período de férias!';
const httpHandler = require('./src/services/httpHandler.js');

exports.handler = async(event) => {



  let request;
  if (event.body === undefined) {
    request = event;
  }
  else {
    request = JSON.parse(event.body);
  }



  // Executa a validação customizada para cada solicitação de férias

  request.input.vacationSchedules.forEach(schedule => validate(request.output, schedule));



  const response = {

    statusCode: 200,

    body: JSON.stringify(request.output),

  };

  return response;



};





/**

* Executa as validações customizadas sobre a solicitação de férias

*

* @param output Mensagens de erro

* @param vacationSchedule Programação de férias

* @returns Mensagens de erro, as informações da solicitação de férias

*//*

const validate = async(output, vacationSchedule) => {

  const currentDate = new Date();

  const startDate = new Date(vacationSchedule.startDate);



  // Remove a mensagem de erro referente a quantidade de dias de antecedência

  removeValidationMessage(output, vacationSchedule, 'TYPE_1_VACATION_SCHEDULING_IN_ADVANCE');



  // Valida se o mês e ano de início das férias é igual ao mês atual

  if (startDate.getUTCMonth() === currentDate.getUTCMonth()

    &&
    startDate.getFullYear() === currentDate.getFullYear()) {

    let currentMonthName = MONTH_NAMES[startDate.getUTCMonth()];

    let message = replace(CURRENT_MONTH_ERROR_MESSAGE, '${REQUEST_MONTH}', currentMonthName);

    addValidationMessage(output, vacationSchedule, message);

  }
  else {

    // Valida se a data atual é maior que o dia limite de solicitação das férias e se o mês de início das férias é o próximo mês, considerando janeiro do ano seguinte

    if (currentDate.getUTCDate() > MAX_DAY_REQUEST &&

      (((currentDate.getUTCMonth() + 1) === startDate.getUTCMonth() && startDate.getYear() === currentDate.getYear()) ||

        ((startDate.getYear() === (currentDate.getYear() + 1)) && ((startDate.getUTCMonth()) === 0)) && (currentDate.getUTCMonth()) === 11)) {

      let currentMonthName = MONTH_NAMES[startDate.getUTCMonth()];

      let message = replace(MAX_DAY_REQUEST_ERROR_MESSAGE, '${REQUEST_MONTH}', currentMonthName);

      addValidationMessage(output, vacationSchedule, message);

    }

  }



  // VALIDA SE É UMA QUINTA FEIRA

  if (startDate.getDay() == 4) {

    addValidationMessage(output, vacationSchedule, THURSDAY_ERROR_MESSAGE);

  }



  //Valida se possui dias de abono
  if (vacationSchedule.vacationBonusDays > 0) {
    let tokenSeniorX = undefined;
    tokenSeniorX = 'Bearer a3c84cfd2a186a7201936f5f8d316189';

    if (vacationSchedule === undefined) {
      tokenSeniorX = event.headers['X-Senior-Token'];
    }
    let httpUrl = '/hcm/vacationmanagement/entities/individualvacationschedule?filter=vacationperiod eq \'' + vacationSchedule.vacationPeriodId + '\'';
    let periods = await httpHandler.executeHttpGet(httpUrl, tokenSeniorX);
    if (periods.totalElements > 1) {
      addValidationMessage(output, vacationSchedule, BONUSDAY_ERROR_MESSAGE);
    }
  }
  if (output != null && output.vacationScheduleMessages != null && output.vacationScheduleMessages.length > 0) {
    output.vacationScheduleMessages = output.vacationScheduleMessages.filter(vacationScheduleMessage => {
      return vacationScheduleMessage.validationMessages != null && vacationScheduleMessage.validationMessages.length > 0;
    });
  }
};


/**

* Adiciona uma mensagem customizada a uma validação de férias
*
* @param output Mensagens de erro
* @param vacationSchedule Solicitação de férias
* @param message Mensagem que será dicionada
*//*

const addValidationMessage = (output, vacationSchedule, message) => {
  if (output.vacationScheduleMessages == null) {
    output.vacationScheduleMessages = [];
  }


  let vacationScheduleMessages = output.vacationScheduleMessages.find(vacationScheduleMessages => vacationScheduleMessages.employeeId === vacationSchedule.employeeId);
  if (vacationScheduleMessages != null) {
    addMessage(vacationScheduleMessages, message);
  }
  else {
    let vacationScheduleMessages = {
      employeeId: vacationSchedule.employeeId,
      vacationPeriodId: vacationSchedule.vacationPeriodId,
      startDate: vacationSchedule.startDate
    };
    addMessage(vacationScheduleMessages, message);
    output.vacationScheduleMessages.push(vacationScheduleMessages);
  }
};

/**
 * Cria uma mensagem de validação
 *
 * @param vacationScheduleMessages Mensagens de erro
 * @param message Mensagem
 */
/*
const addMessage = (vacationScheduleMessages, message) => {
  if (vacationScheduleMessages.validationMessages == null) {
    vacationScheduleMessages.validationMessages = [];
  }
  vacationScheduleMessages.validationMessages.push({
    message: message
  });
};



/**

* Remove uma mensagem de validação da lista de mensagens existentes

*
*  @param output Mensagens de erro
*  @param vacationSchedule Solicitação de férias
*  @param validationMessageType Tipo de mensagem de validação
*/
/*
const removeValidationMessage = (output, vacationSchedule, validationMessageType) => {
  if (output != null && output.vacationScheduleMessages != null && output.vacationScheduleMessages.length > 0) {
    let vacationScheduleMessages = output.vacationScheduleMessages.find(vacationScheduleMessages => vacationScheduleMessages.employeeId === vacationSchedule.employeeId);
    if (vacationScheduleMessages != null && vacationScheduleMessages.validationMessages != null && vacationScheduleMessages.validationMessages.length > 0) {
      vacationScheduleMessages.validationMessages = vacationScheduleMessages.validationMessages.filter(validationMessage => validationMessageType !== validationMessage.type);
    }
  }
};


const replace = (message, key, value) => {
  while (message.indexOf(key) >= 0) {
    message = message.replace(key, value);
  }
  return message;
};*/
};