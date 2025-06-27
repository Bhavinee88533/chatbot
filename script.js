let input=document.querySelector("input[type='text']");
let imgbtn=document.querySelector("#file-upload");
let container=document.querySelector(".container");
let send=document.querySelector("button");
const img = document.getElementById("file-img");


let user={
    message:null,
    file:{
        mime_type:null,
        data:null
    }
}
const api="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyDCILKT0f1iR_O_KIJ51YgMltNuc_dpk-4"
function creatediv(classes) {
    let div=document.createElement("div");
    div.classList.add(classes);
    return div
}



imgbtn.addEventListener("change", (event) => {
    console.log(event)
    const file = imgbtn.files[0];
    if (!file) {
       return;
    } 
    let reader=new FileReader()
    reader.onload=(e)=>{
        let base64=e.target.result.split(",")[1]
        user.file={
        mime_type:file.type,
        data:base64
    }
        img.style.backgroundImage = `url("data:${user.file.mime_type};base64,${user.file.data}")`;
        img.style.backgroundSize = "cover";
        img.style.border = "2px solid white";
    }
     reader.readAsDataURL(file);
});

async function getans(msg) {
    console.log(msg)
    user.message=msg;
    try{
        console.log(user)
        let ans=await fetch(api,{
            method:"POST",
            headers:{'Content-Type': 'application/json'},
            body:JSON.stringify({
                "contents": [
                    {
                        "parts": [
                            {
                                "text": user.message
                            },
                            ...(user.file.data?[{
                                "inline_data": {
                                    "mime_type":user.file.mime_type,
                                    "data": user.file.data
                                }
                            }]:[])
                        ]
                    }
                ]
            })
        })
        let data=await ans.json()
        
        return data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,"$1").trim();
    }catch(e){
        console.log(e)
    }
}

async function handleReply(msg, div) {
    div.innerHTML = `
        <i class="fa-solid fa-robot"></i>
        <div class="text loader" style="border-top-right-radius: 10px;">Typing<span class="dots">...</span></div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;

    const ans = await getans(msg);
    div.innerHTML = `
        <i class="fa-solid fa-robot"></i>
        <div class="text" style="border-top-right-radius: 10px;">${ans}</div>
    `;
    container.scrollTop = container.scrollHeight;
}


function handleQuery(usermsg){

    let div = creatediv("userbox");
    div.innerHTML = `
        <div class="text" style="border-top-left-radius: 10px;">
            ${usermsg}
            ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" style="max-width: 200px; max-height: 200px; display: block; margin-top: 10px;" />` : ""}
        </div>
        <i class="fa-solid fa-user"></i>
    `;
    container.appendChild(div);
    input.value = "";
    img.style.backgroundImage = `url('https://cdn-icons-png.flaticon.com/512/16/16410.png')`;
    img.style.backgroundSize = "70%";
    img.style.border = "none";
    container.scrollTop = container.scrollHeight;

    setTimeout(() => {
        let div = creatediv("botbox");
        handleReply(usermsg, div);
        user.file = { mime_type: null, data: null };
    }, 500);
}



addEventListener("keydown",(e)=>{
    if(e.key==="Enter"){
        handleQuery(input.value);
    }
})

send.addEventListener("click", () => {
    handleQuery(input.value);
});
