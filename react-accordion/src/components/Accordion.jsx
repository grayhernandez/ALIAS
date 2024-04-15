import { useState } from "react";

const dataCollection = [
    {
        "title": "LEARNING DELIVERY MODES FOR AY 2023-2024",
        "contents": [
            "To foster academic excellence, equip learners with skills for life in the 21st century, and enable them to attain educational resilience and learning continuity in the next normal, UP is moving forward with blended learning, which combines face-to-face (f2f) and online learning experience. There are three (3) main models of blended learning:",
                
                "Blended online learning (Model 1) is fully online, combining asynchronous and synchronous online learning.",
                "Blended block learning (Model 2) combines blocks of independent online study and intensive f2f sessions.",
                "Classic blended learning (Model 3) alternates or rotates f2f sessions and asynchronous online learning."
                ,
            "Undergraduate courses will follow either Model except for clinical rotations, internships, on-the-job training, intensive laboratories, community-based immersion, and similar programs. Graduate courses, on the other hand, may opt to follow Model 1, 2, or 3. For models 2 and 3, the face-to-face component should be 50% to 75% and delivered in a learning-centered context following, for example, the ﬂipped classroom model. The hyflex mode may be adopted, provided its infrastructure is in place. Exemptions to the delivery mode may be pursued with the Chancellor based on need and circumstances."
            ]
    },

    {
        "title": "Academic Calendar",
        "contents": [
            "The Undergraduate Academic Calendar for AY 2023-2024 was approved by UP OIC President Jose Fernando T. Alcantara on 09 May 2023. It follows the 16-week semester term with a reading break and 5-week midyear term with no reading break. Reading break is a scheduled period where class schedules and academic requirements are temporarily suspended to support faculty and student wellness. While there are no scheduled submissions or academic activities during this time, students are encouraged to create a balanced study and relaxation plan to maintain momentum for when classes resume."
        ]
    },
    {
        "title": "Academic Load",
        "contents": [
            "Undergraduate students shall not be allowed to take more than 18 non-laboratory units or 21 units including laboratory work; provided, however, that graduating students with an academic record better than average may be permitted to carry a heavier load in the last year of their course; provided, further, that this rule shall not affect or alter any existing course duly approved by the University Council and the Board of Regents in which the normal semestral load is more than 18 units.", "In the midyear term, the normal load shall be six units, but in justiﬁable cases, the Dean may allow a student to take 9 units", "For students participating in the UP Undergraduate Student International Mobility (MOVE UP) program, the minimum required number of credited units within an academic year for courses taken in UP shall be reduced from 30 to 24 units in the academic year that the students shall participate in the program."
        ]
    },
    {
        "title": "Medium of Instruction",
        "contents": [
            "English is generally used as the medium of instruction in the University. The UP Language Policy provides for the development and use of the Filipino language while maintaining English as  a  global lingua franca. The Policy states that Filipino shall be the medium of instruction in the University at the undergraduate, within a reasonable timeframe or transition period. Graduate courses of study shall be in English, though there could very well be graduate courses of study in which the medium of instruction is Filipino. English shall be maintained as the primary international language in the University to serve as its chief medium of access to the world's intellectual discourse."
        ]
    },
    {
        "title": "Classification of Students",
        "contents": [
            "Students of the University are classiﬁed as either regular, irregular or non-regular."
        ]
    },

]

function Accordion(){

    const [accordion, setActiveAccordion] = useState(-1);
    function toggleAccordion(index){
        setActiveAccordion(index);
    }

    return(
        <>
        <div className="container">
            <div>
                <span className="accordion__title">FAQs</span>
                <h2>Let's answer it!</h2>
            </div>
            <div className="accordion__faq">
                {dataCollection.map((item, index) =>
                    <div key={index} onClick={()=> toggleAccordion(index)}>
                        <div className="accordion__faq-heading">
                            <h3 className={accordion === index ? "active" : ""}>{item.title}</h3>
                        </div>
                        <div>
                        {accordion === index ? (
                            <>
                                <span className="verticles">-</span>
                            </>

                        ):(
                        <>
                            <span className="verticles">+</span>
                        </>
                        )}
                            
                        </div>
                        <div>
                            <p className={accordion === index ? "active" : "inactive"} >{item.contents}</p>
                        </div>
                    </div>
                 

                )}
            </div>
        </div>
        </>
    )
}
export default Accordion;