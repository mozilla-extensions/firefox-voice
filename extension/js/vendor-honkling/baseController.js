$("#navBarPlaceholder").load("view/header.html");
$("#footerPlaceholder").load("view/footer.html");

var isMobile = false; //initiate as false
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
|| /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) {
  isMobile = true;
}

var ua = navigator.userAgent;

// Firefox
var isFirefox = /Firefox/i.test(ua);

// Chrome
var isChrome = /Chrome/i.test(ua);

// iOS
var isiOS = /iPad|iPhone|iPod/i.test(ua) && !window.MSStream;

if (isiOS) {
  alert('Honkling is not supported on iOS');
} else if (!isFirefox && !isChrome) {
  alert('Honkling is not supported on this browser\nWe recommand Firefox or Chrome');
}

// functionality

// This is just a logging window where we display the status
function updateStatus(newStatus) {
  $('#statusBar').text(newStatus);
};

let toggleTime = 1500;

function init_view() {
  let target_commands = [];
  for (var i = 0; i < inferenceEngineConfig['inference_sequence'].length; i++) {
    let command = commands[inferenceEngineConfig['inference_sequence'][i]];
    if (target_commands.indexOf(command) == -1) {
      target_commands.push(command)
    }
  }

  for (let i = 0; i < target_commands.length; i++) {
    $('#commandList1').append(
      $('<li>').attr('class','list-group-item ' + target_commands[i] + '_button text-center').append(target_commands[i].toUpperCase()));
  }

  $('#commandList2').append(
    $('<li>').attr('class','list-group-item hey_fire_fox_button text-center').append("hey firefox"));

  $('#commandList3').append(
    $('<li>').attr('class','list-group-item unknown_button text-center').append("unknown"));

  $('.unknown_button').addClass('list-group-item-dark');
}

let lastCommand;
let lastToggleTime = 0;

function toggleCommand(command) {
  lastCommand = command;
  lastToggleTime = new Date().getTime();
  $('.commandList .active').removeClass('active');
  $('.commandList .'+command+'_button').addClass('active');
}

function toggleFullWord() {
  if (!$('.commandList .hey_fire_fox_button').hasClass('active')) {
    console.log("HEY FIREFOX DETECTED")
    $('.commandList .hey_fire_fox_button').addClass('active');
    setTimeout(function () {
      $('.commandList .hey_fire_fox_button').removeClass('active');
    }, 4000);
  }
}

function updateToggledCommand(command) {

  command = command.toLowerCase();

  if (command == 'silence') {
    command = 'unknown';
  }

  if (command.includes('unknown')) {
    command = 'unknown';
  }

  if (!commands.includes(command)) {
    command = 'unknown'
  }

  currentTime = new Date().getTime();

  if (command != 'unknown') {
    if (lastCommand != command) {
      updateStatus('keyword spoken is ... ' + command.toUpperCase() + ' !!');
      toggleCommand(command);
    }
  } else if (lastCommand != 'unknown' && currentTime > lastToggleTime + toggleTime) {
    // current command is unknown
    updateStatus('Say one of the following keywords');
    toggleCommand(command);
  }
}
